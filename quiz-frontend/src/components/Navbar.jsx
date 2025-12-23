// src/components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple page title mapping
  const titles = {
    "/dashboard": "Dashboard",
    "/select": "Create Quiz",
    "/leaderboard": "Leaderboard",
    "/progress": "Progress",
    "/analytics": "Analytics",
    "/profile": "Profile",
  };

  const pageTitle = titles[location.pathname] || "QuizGen";

  return (
    <header className="sticky top-0 z-40 bg-[#0B1220] border-b border-white/10">
      <div className="h-16 px-8 flex items-center justify-between">

        {/* LEFT — BRAND + CONTEXT */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => navigate("/dashboard")}
            className="text-xl font-extrabold tracking-tight text-white cursor-pointer"
          >
            QuizGen
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="text-sm text-slate-400">
            {pageTitle}
          </div>
        </div>

        {/* RIGHT — ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 rounded-lg bg-white/10 text-sm text-slate-200 hover:bg-white/20 transition"
          >
            Profile
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
