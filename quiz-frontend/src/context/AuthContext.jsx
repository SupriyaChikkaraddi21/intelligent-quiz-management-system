import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // FETCH CURRENT USER
  // =============================
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Auth error:", error?.response?.status);

      // ❗ Do NOT remove token here
      // 401 may happen during login race
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

    // save token
    localStorage.setItem("token", token);

    // attach token globally
    api.defaults.headers.common["Authorization"] = `Token ${token}`;

    // if profile already fetched → avoid extra call
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    // otherwise fetch profile once
    await fetchUser();
  };

  // =============================
  // LOGOUT
  // =============================
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
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

    // attach header BEFORE fetching
    api.defaults.headers.common["Authorization"] = `Token ${token}`;

    fetchUser();
  }, [fetchUser]);

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