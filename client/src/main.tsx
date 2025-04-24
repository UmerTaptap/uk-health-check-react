import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Redirect, Route, Switch } from "wouter";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";


createRoot(document.getElementById("root")!).render(
  // <App />
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/" component={() => <Redirect to="/signup" />} />
        <Route path="/signup" component={Signup} />

        <Route path="/login" component={Login} />

        <Route path="/forgot-password" component={ForgotPassword} />

        <Route path="/dashboard" component={App} />


      </Switch>
      {/* <App /> */}
    </BrowserRouter>
  </React.StrictMode>
);
