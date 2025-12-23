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
    <aside className="w-64 min-h-screen bg-[#0B1220] border-r border-white/10 px-4 py-6">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm transition ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                  : "text-slate-300 hover:bg-white/10"
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
          className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
