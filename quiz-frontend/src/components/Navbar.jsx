import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Page title mapping
  const titles = {
    "/dashboard": "Dashboard",
    "/select": "Create Quiz",
    "/leaderboard": "Leaderboard",
    "/rewards": "Rewards", // 🔥 ADDED
    "/progress": "Progress",
    "/analytics": "Analytics",
    "/profile": "Profile",
  };

  const pageTitle = titles[location.pathname] || "QuizGen";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-sky-200">
      <div className="h-16 px-8 flex items-center justify-between">

        {/* LEFT — BRAND + CONTEXT */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => navigate("/dashboard")}
            className="text-xl font-extrabold tracking-tight
                       text-slate-900 cursor-pointer"
          >
            Quiz<span className="text-sky-500">Gen</span>
          </div>

          <div className="h-6 w-px bg-sky-200" />

          <div className="text-sm text-slate-600">
            {pageTitle}
          </div>
        </div>

        {/* RIGHT — EMPTY (reserved for future) */}
        <div />

      </div>
    </header>
  );
}
