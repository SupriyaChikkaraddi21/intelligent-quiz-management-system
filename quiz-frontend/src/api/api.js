import axios from "axios";

// ==========================================
// BASE API INSTANCE
// ==========================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// ATTACH TOKEN HELPER
// ==========================================
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ==========================================
// REQUEST INTERCEPTOR (AUTO ATTACH TOKEN)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Token ${token}`;
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

    // Only clear token if profile endpoint confirms invalid auth
    if (
      status === 401 &&
      error.config?.url?.includes("/accounts/profile")
    ) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
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