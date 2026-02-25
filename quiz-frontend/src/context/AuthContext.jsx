import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // ATTACH TOKEN HEADER
  // =============================
  const setAuthHeader = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Token ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // =============================
  // FETCH CURRENT USER
  // =============================
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Auth error:", error?.response?.status);

      if (error.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================
  // LOGIN
  // =============================
  const login = async (token, userData = null) => {
    if (!token) return;

    localStorage.setItem("token", token);
    setAuthHeader(token);

    // if profile already fetched (Google flow)
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    await fetchUser();
  };

  // =============================
  // LOGOUT
  // =============================
  const logout = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setUser(null);
  };

  // =============================
  // RESTORE SESSION ON REFRESH
  // =============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    setAuthHeader(token);
    fetchUser();

    // ❗ IMPORTANT: empty dependency array
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);