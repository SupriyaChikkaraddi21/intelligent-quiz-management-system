// src/api/api.js

import axios from "axios";

// Base API instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

// Global response handler
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // If token expired or invalid → logout user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");

      // Redirect to login only if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
