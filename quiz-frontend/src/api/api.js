import axios from "axios";

// ==========================================
// BASE API INSTANCE
// ==========================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// ==========================================
// REQUEST INTERCEPTOR (ATTACH TOKEN)
// ==========================================
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (e) {
      // ignore storage issues
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
    const status = error?.response?.status;

    // ❗ Only clear token if authentication is truly invalid
    if (status === 401 && error.config?.url?.includes("/accounts/profile")) {
      try {
        localStorage.removeItem("token");
      } catch (e) {}
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