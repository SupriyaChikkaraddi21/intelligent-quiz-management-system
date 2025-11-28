import React from "react";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
