import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Route, Switch } from "wouter";
import Signup from "./pages/Signup";

createRoot(document.getElementById("root")!).render(
  // <App />
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/signup" component={Signup} />
      </Switch>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
