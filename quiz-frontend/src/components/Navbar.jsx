import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    "/dashboard": "Dashboard",
    "/select": "Create Quiz",
    "/leaderboard": "Leaderboard",
    "/rewards": "Rewards",
    "/progress": "Progress",
    "/analytics": "Analytics",
    "/profile": "Profile",
  };

  const pageTitle = titles[location.pathname] || "QuizGen";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-sky-200">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">

          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-white"
          >
            ☰
          </button>

          {/* Brand */}
          <div
            onClick={() => navigate("/dashboard")}
            className="text-xl font-extrabold tracking-tight text-slate-900 cursor-pointer"
          >
            Quiz<span className="text-sky-500">Gen</span>
          </div>

          {/* Divider (hide on small screens) */}
          <div className="hidden md:block h-6 w-px bg-sky-200" />

          {/* Page Title */}
          <div className="hidden sm:block text-sm text-slate-600">
            {pageTitle}
          </div>

        </div>

        {/* Right reserved section */}
        <div />
      </div>
    </header>
  );
}