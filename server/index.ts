import express, { type Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import axios from "axios";
import { UserController } from "./controllers/UserController";
import { UserRoutes } from "./routes/UserRoutes";
import { HealthDataController } from "./controllers/HealthDataController";
import { HealthDataRoute } from "./routes/HealthDataRoute";
import cors from 'cors';
import 'dotenv/config';
const app = express();
const MONGO_URI = process.env.MONGO_URI || 'your-fallback-uri';
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Temporarily comment out express-fileupload middleware to use a custom implementation
// app.use(fileUpload({
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
//   abortOnLimit: true,
//   useTempFiles: false, // Changed to false to use memory buffers instead of temp files
//   debug: true,
//   safeFileNames: true,
//   preserveExtension: true,
//   createParentPath: true
// }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});





const userController = new UserController();
const userRoutes = new UserRoutes(userController);
app.use('/api', userRoutes.getRouter());


const healthDataController = new HealthDataController();
const healthDataRoute = new HealthDataRoute(healthDataController);
app.use('/api', healthDataRoute.getRouter());









// api/proxy/index.ts

app.get('/api/proxy/area-search', async (req, res) => {
  try {
    const { searchText } = req.query;
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/area_search`,
      {
        params: {
          v: '/0-32313c67/',
          area_type_ids: '167,402,401,8,15,3',
          search_text: searchText
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/api/proxy/latest-data', async (req, res) => {
  try {
    const { areaCode, profileId } = req.query;
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/latest_data/all_indicators_in_profile_group_for_child_areas`,
      {
        params: {
          v: '/0-32313c67/',
          area_type_id: 3,
          profile_id: profileId,
          parent_area_code: 'E92000001', // England
          group_id: 1938133185,
          child_area_code: areaCode
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proxy/profiles', async (req, res) => {
  try {
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/profiles`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proxy/indicator-metadata', async (req, res) => {
  try {
    const { groupId } = req.query;
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/indicator_metadata/by_group_id`,
      {
        params: {
          v: '/0-32313c67/',
          include_system_content: 'yes',
          include_definition: 'yes',
          group_ids: groupId
        }
      }
    );


    console.log(`IndicatorData: ${JSON.stringify(response.data, null, 2)}`);


    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proxy/group-subheadings', async (req, res) => {
  try {
    const { groupId } = req.query;
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/group_subheadings`,
      {
        params: {
          v: '/0-32313c67/',
          area_type_id: 3,
          group_id: groupId
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proxy/indicator-statistics', async (req, res) => {
  try {
    const { profileId, areaCode } = req.query;
    console.log(`Profile_ID: ${profileId}`);
    const response = await axios.get(
      `https://fingertips.phe.org.uk/api/indicator_statistics/by_profile_id`,
      {
        params: {
          v: '/0-32313c67/',
          parent_area_code: areaCode,
          child_area_type_id: 3,
          group_id: 1938133185,
          profile_id: profileId
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



mongoose.connect(MONGO_URI)
  .then(() => log('Connected to MongoDB'))
  .catch((err) => log('MongoDB connection error:', err));

// Add event listeners for MongoDB connection
mongoose.connection.on('connected', () => {
  log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  log('Mongoose disconnected');
});


(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000; // or 5000, 8080, etc.
  server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
  });
  
})();
