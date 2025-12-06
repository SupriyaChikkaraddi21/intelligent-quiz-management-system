// src/api/api.js
import axios from "axios";

// Base API instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/",   // <- trailing slash is intentional & required
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  } catch (e) {
    // swallow localStorage errors in restricted envs
  }
  return config;
});

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      // token invalid/expired → force logout
      try {
        localStorage.removeItem("token");
      } catch (e) {}
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
