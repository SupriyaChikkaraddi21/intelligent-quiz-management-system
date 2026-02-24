import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logged-in user
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Auth error:", error?.response?.status);

      // ❗ Only logout if token is truly invalid
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Login handler
  const login = async (token) => {
    // save token
    localStorage.setItem("token", token);

    // attach token globally
    api.defaults.headers.common["Authorization"] = `Token ${token}`;

    try {
      const res = await api.get("/accounts/profile/");
      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch failed after login", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // 🔹 Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

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