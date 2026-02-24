import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Auth error:", error);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    // 🔥 Save token
    localStorage.setItem("token", token);

    // 🔥 Attach token globally to axios
    api.defaults.headers.common["Authorization"] = `Token ${token}`;

    setLoading(true);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 🔥 Re-attach token on page refresh
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
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);