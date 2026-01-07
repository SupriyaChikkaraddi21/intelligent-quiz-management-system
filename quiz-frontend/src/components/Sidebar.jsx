// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", to: "/dashboard" },
  { name: "Create Quiz", to: "/select" },
  { name: "Leaderboard", to: "/leaderboard" },
  { name: "Progress", to: "/progress" },
  { name: "Analytics", to: "/analytics" },
  { name: "Profile", to: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-sky-200 px-4 py-6">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm transition ${
                isActive
                  ? "bg-sky-100 text-sky-600 font-semibold border border-sky-200"
                  : "text-slate-600 hover:bg-sky-50"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 px-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="w-full py-2 rounded-lg
                     bg-red-100 text-red-600 text-sm
                     hover:bg-red-200 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
