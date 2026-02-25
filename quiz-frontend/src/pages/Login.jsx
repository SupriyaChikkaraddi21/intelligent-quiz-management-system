// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/accounts/login/", {
        email,
        password,
      });

      await login(res.data.token);
      setTimeout(() => {navigate("/dashboard");},100);

    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const backendMessage = err.response.data?.error;

        if (status === 403) {
          setError("Please verify your email before logging in.");
        } else if (status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(backendMessage || "Login failed.");
        }
      } else {
        setError("Server not reachable.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(cred) {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/accounts/google-login/", {
        credential: cred.credential,
      });

      const token = res.data.token;

      if (!token) throw new Error("Token missing");

      // ✅ save token
      localStorage.setItem("token", token);
  api.defaults.headers.common["Authorization"] = `Token ${token}`;

    // ✅ fetch profile manually
      const profileRes = await api.get("/accounts/profile/");

    // ✅ pass user directly (stops race condition)
      await login(token, profileRes.data);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-[0_40px_80px_rgba(0,0,0,0.12)] p-8">
        
        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Quiz<span className="text-sky-500">Gen</span>
          </h1>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome back
        </h2>

        <p className="text-sm text-slate-600 text-center mb-8">
          Sign in to continue learning smarter
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-11 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-sky-500 transition"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-sky-500 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-600 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-7 flex items-center">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-3 text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Google login failed")}
          auto_select={false}
          useOneTap={false}
          />
        </div>

        <p className="text-center text-sm text-slate-600 mt-8">
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-sky-500 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}