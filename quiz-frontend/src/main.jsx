import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "495278527722-jei6qqvig7d2srd9600vo4fvh62i8a75.apps.googleusercontent.com"; // <-- PUT YOUR CLIENT ID HERE

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
