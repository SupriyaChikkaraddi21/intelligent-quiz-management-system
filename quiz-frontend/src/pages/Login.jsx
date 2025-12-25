// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
      localStorage.getItem("email");

    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/accounts/login/", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  }

  function handleGoogleLogin(cred) {
    api
      .post("/accounts/google-login/", { credential: cred.credential })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      })
      .catch(() => setError("Google login failed"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-white via-sky-50 to-sky-100 px-4">

      <div className="w-full max-w-md bg-white border border-sky-200
                      rounded-2xl shadow-lg p-8">

        <h2 className="text-3xl font-bold text-center mb-2 text-slate-900">
          Welcome Back
        </h2>

        <p className="text-sm text-slate-600 text-center mb-6">
          Sign in to continue to QuizGen
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100
                          border border-red-300 rounded-md p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 rounded-lg bg-white border border-sky-200
                       focus:ring-2 focus:ring-sky-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-white border border-sky-200
                         pr-10 focus:ring-2 focus:ring-sky-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center
                         text-slate-400 hover:text-sky-500"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            className="w-full bg-sky-500 hover:bg-sky-600 text-white
                       font-semibold py-3 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-sky-200" />
          <span className="px-3 text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-sky-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login error")}
          />
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          New here?{" "}
          <Link
            to="/register"
            className="text-sky-500 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
