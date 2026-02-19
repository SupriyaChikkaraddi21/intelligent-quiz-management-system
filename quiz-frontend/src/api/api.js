// src/api/api.js
import axios from "axios";

// ================================
// BASE API INSTANCE
// ================================
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/", // ✅ UPDATED TO v1
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ================================
// REQUEST INTERCEPTOR (AUTH TOKEN)
// ================================
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (e) {
      // ignore localStorage access issues
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// RESPONSE INTERCEPTOR
// ================================
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

// =======================================================
// USER QUIZ HELPERS (UNCHANGED)
// =======================================================

// Fetch single user-created quiz (for edit)
export const getUserQuizById = (quizId) =>
  api.get(`/quiz/${quizId}/`);

// Update existing user quiz
export const updateUserQuiz = (quizId, payload) =>
  api.put(`/quiz/${quizId}/update/`, payload);

// Optional: delete quiz (future-safe)
export const deleteUserQuiz = (quizId) =>
  api.delete(`/quiz/${quizId}/delete/`);

export default api;
