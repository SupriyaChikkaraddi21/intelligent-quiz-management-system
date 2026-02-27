import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post("/auth/password-reset-confirm/", {
        uid,
        token,
        new_password: password,
      });

      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">

      <div className="relative w-full max-w-md p-8 rounded-3xl
                      bg-white/5 backdrop-blur-xl
                      border border-white/10 shadow-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl
                       bg-white/10 text-white placeholder-slate-400
                       border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <input
            type="password"
            required
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
                       shadow-lg shadow-sky-500/30"
          >
            {loading ? "Resetting..." : "Reset Password"}
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

      </div>
    </div>
  );
}