// src/api/api.js
import axios from "axios";

// ==========================================
// BASE API INSTANCE (PRODUCTION READY)
// ==========================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ==========================================
// REQUEST INTERCEPTOR (AUTH TOKEN)
// ==========================================
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (e) {
      // ignore localStorage issues
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// USER QUIZ HELPERS
// ==========================================

export const getUserQuizById = (quizId) =>
  api.get(`/quiz/${quizId}/`);

export const updateUserQuiz = (quizId, payload) =>
  api.put(`/quiz/${quizId}/update/`, payload);

export const deleteUserQuiz = (quizId) =>
  api.delete(`/quiz/${quizId}/delete/`);

export default api;