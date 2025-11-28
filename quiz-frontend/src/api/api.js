import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",   // IMPORTANT FIX
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;
