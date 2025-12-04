import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in  
  if (localStorage.getItem("token")) {
    navigate("/dashboard");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/accounts/login/", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  }

  function handleGoogleLogin(cred) {
    api
      .post("/accounts/google-login/", {
        credential: cred.credential,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      })
      .catch(() => alert("Google login failed"));
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold text-[#1F3A5F]">QuizGen</span>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8">
          
          {/* Title */}
          <h2 className="text-2xl font-semibold text-[#1E293B] text-center">
            Welcome Back
          </h2>
          <p className="text-sm text-[#64748B] text-center mb-6">
            Login to access your dashboard
          </p>

          {/* Error Box */}
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[#1E293B]
                focus:outline-none focus:ring-2 focus:ring-[#2BB0A6] focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[#1E293B]
                focus:outline-none focus:ring-2 focus:ring-[#2BB0A6] focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#F5A623] hover:bg-[#e09119] text-white
              font-semibold rounded-lg transition shadow-sm"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-4 flex items-center">
            <div className="flex-1 h-px bg-gray-200"></div>
            <p className="px-3 text-xs text-[#64748B]">OR</p>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Google login error")}
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-[#64748B] mt-6">
            New here?{" "}
            <Link to="/register" className="text-[#1F3A5F] font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Policy Note */}
        <p className="text-center text-xs text-[#94A3B8] mt-4">
          By logging in, you agree to our usage policies.
        </p>
      </div>
    </div>
  );
}
