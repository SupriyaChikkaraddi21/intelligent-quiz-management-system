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
  const [role, setRole] = useState("student"); // 🔥 NEW
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/accounts/register/", {
        name,
        email,
        password,
        role, // 🔥 SEND ROLE
      });

      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        "Registration failed. Please try another email."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup(cred) {
    setError("");

    api
      .post("/accounts/google-login/", {
        credential: cred.credential,
        role, // 🔥 optional: pass role for google too (backend can ignore if needed)
      })
      .then(() => navigate("/login"))
      .catch(() => setError("Google signup failed"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4
                    bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100">

      <div className="w-full max-w-md bg-white rounded-3xl
                      border border-slate-200
                      shadow-[0_40px_80px_rgba(0,0,0,0.12)]
                      p-8">

        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Quiz<span className="text-sky-500">Gen</span>
          </h1>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Create your account
        </h2>

        <p className="text-sm text-slate-600 text-center mb-8">
          Start learning smarter with AI-powered quizzes
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-300
                          bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-300
                       px-4 py-3 text-sm
                       focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                       outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-300
                       px-4 py-3 text-sm
                       focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                       outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* 🔥 ROLE SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              I am registering as
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300
                         px-4 py-3 text-sm bg-white
                         focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                         outline-none transition"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-300
                         px-4 py-3 pr-11 text-sm
                         focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                         outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center
                         text-slate-400 hover:text-sky-500 transition"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 py-3
                       font-semibold text-white
                       hover:bg-sky-600 transition
                       disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="my-7 flex items-center">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-3 text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* GOOGLE */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => setError("Google signup failed")}
          />
        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-600 mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-sky-500 hover:underline"
          >
            Login
          </Link>
        </p>

        <p className="text-xs text-slate-400 text-center mt-4">
          By signing up, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}
