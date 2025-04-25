import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Redirect, Route, Switch } from "wouter";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Dashboard from "./pages/Dashboard";


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        {/* <Route path="/" component={() => <Redirect to="/signup" />} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} /> */}
        <PublicRoute path="/signup" component={Signup} />
        <PublicRoute path="/login" component={Login} />
        <App />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>
);
