import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post("/auth/password-reset/", { email });
      setMessage(
        "If an account with this email exists, a reset link has been sent."
      );
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
                    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <div className="w-full max-w-md p-8 rounded-3xl
                      bg-white/5 backdrop-blur-xl
                      border border-white/10
                      shadow-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-3">
          Forgot Password
        </h2>

        <p className="text-sm text-slate-300 text-center mb-8">
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl
                       bg-white/10 text-white placeholder-slate-400
                       border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl
                       bg-sky-500 text-white font-semibold
                       hover:bg-sky-600
                       transition-all duration-200
                       shadow-lg shadow-sky-500/30
                       disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div className="text-green-400 text-sm text-center mt-4">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm text-center mt-4">
            {error}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-sky-400 hover:text-sky-300 hover:underline transition"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}