// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/accounts/register/", { name, email, password });
      navigate("/login");
    } catch {
      setError("Registration failed. Try another email.");
    }
  }

  function handleGoogleSignup(cred) {
    api
      .post("/accounts/google-login/", { credential: cred.credential })
      .then(() => navigate("/login"))
      .catch(() => setError("Google signup failed"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#020617] px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          Join QuizGen and start learning smarter
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 pr-10 focus:ring-2 focus:ring-cyan-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition">
            Register
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-white/10" />
          <span className="px-3 text-xs text-slate-400">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => setError("Google signup error")}
          />
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
