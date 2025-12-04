// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { theme, setTheme } = useTheme();

  return (
    <nav className="w-full bg-[#0B2341] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => navigate("/dashboard")}
          className="text-2xl font-semibold cursor-pointer tracking-wide"
        >
          QuizGen
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-6 text-sm font-medium">

          {/* THEME TOGGLE */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>

          {!token ? (
            <>
              <Link className="hover:text-[#00B8A9] transition" to="/login">
                Login
              </Link>

              <Link className="hover:text-[#00B8A9] transition" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link className="hover:text-[#00B8A9] transition" to="/dashboard">
                Dashboard
              </Link>

              <Link className="hover:text-[#00B8A9] transition" to="/select">
                Create Quiz
              </Link>

              <Link className="hover:text-[#00B8A9] transition" to="/leaderboard">
                Leaderboard
              </Link>

              <Link className="hover:text-[#00B8A9] transition" to="/profile">
                Profile
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
