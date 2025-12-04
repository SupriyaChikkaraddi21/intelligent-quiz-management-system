import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-6" /> },
    { name: "Create Quiz", path: "/select", icon: <ClipboardDocumentListIcon className="w-6" /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <ChartBarIcon className="w-6" /> },
    { name: "Progress", path: "/progress", icon: <ChartBarIcon className="w-6" /> },
    { name: "Profile", path: "/profile", icon: <UserIcon className="w-6" /> },
  ];

  return (
    <div
      className={`h-screen bg-[#1F3A5F] text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/20">
        <span className={`font-semibold text-lg ${collapsed ? "hidden" : ""}`}>
          QuizGen
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/20 p-2 rounded-md"
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>

      {/* Menu Items */}
      <div className="mt-6 flex flex-col gap-2">
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg
                transition-all cursor-pointer
                ${active ? "bg-[#2BB0A6] text-black" : "hover:bg-white/20"}
              `}
            >
              {item.icon}
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto mb-6 px-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="flex items-center gap-4 px-4 py-3 rounded-lg w-full bg-red-500/80 hover:bg-red-600"
        >
          <ArrowLeftOnRectangleIcon className="w-6" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
