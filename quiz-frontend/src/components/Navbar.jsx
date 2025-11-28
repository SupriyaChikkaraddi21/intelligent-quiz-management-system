import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Heroicons
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  ListBulletIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const activeClass =
    "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 flex items-center gap-2 bg-blue-50 rounded-md px-2 py-1";

  const normalClass =
    "flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition";

  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          QuizGen
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          <Link to="/" className={isActive("/") ? activeClass : normalClass}>
            <HomeIcon className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/select"
            className={isActive("/select") ? activeClass : normalClass}
          >
            <ListBulletIcon className="h-5 w-5" />
            Create Quiz
          </Link>

          <Link
            to="/leaderboard"
            className={isActive("/leaderboard") ? activeClass : normalClass}
          >
            <ChartBarIcon className="h-5 w-5" />
            Leaderboard
          </Link>

          <Link
            to="/profile"
            className={isActive("/profile") ? activeClass : normalClass}
          >
            <UserCircleIcon className="h-5 w-5" />
            Profile
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-3 space-y-4 bg-white border-t p-4 rounded-b-lg">

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={`${isActive("/") ? activeClass : normalClass} block text-lg`}
          >
            <HomeIcon className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/select"
            onClick={() => setOpen(false)}
            className={`${isActive("/select") ? activeClass : normalClass} block text-lg`}
          >
            <ListBulletIcon className="h-5 w-5" />
            Create Quiz
          </Link>

          <Link
            to="/leaderboard"
            onClick={() => setOpen(false)}
            className={`${isActive("/leaderboard") ? activeClass : normalClass} block text-lg`}
          >
            <ChartBarIcon className="h-5 w-5" />
            Leaderboard
          </Link>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className={`${isActive("/profile") ? activeClass : normalClass} block text-lg`}
          >
            <UserCircleIcon className="h-5 w-5" />
            Profile
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
