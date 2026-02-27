import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const commonLinks = [
  { name: "Dashboard", to: "/dashboard" },
  { name: "AI Quiz", to: "/select" },
  { name: "History", to: "/history" },
  { name: "Leaderboard", to: "/leaderboard" },
  { name: "Rewards", to: "/rewards" },
  { name: "Progress", to: "/progress" },
  { name: "Analytics", to: "/analytics" },
  { name: "Profile", to: "/profile" },
];

const classroomLink = {
  name: "My Classrooms",
  to: "/classrooms",
};

const adminLinks = [
  { name: "Admin Dashboard", to: "/admin/dashboard" },
  { name: "Manage Users", to: "/admin/users" },
  { name: "Manage Quizzes", to: "/admin/quizzes" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  if (!token) return null;

  const role = user?.role;

  const baseStyle =
    "block px-4 py-3 rounded-xl text-sm transition-all duration-150";

  const linkStyle = (isActive) =>
    `${baseStyle} ${
      isActive
        ? "bg-white/10 text-white shadow-inner"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <>
      {/* ===== Mobile Hamburger Button ===== */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {/* ===== Overlay (Mobile) ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 z-50
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-white/10 px-4 py-6
          transform ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300
          md:static md:translate-x-0 md:flex md:shrink-0
        `}
      >
        <nav className="space-y-1 flex-1 overflow-y-auto">

          {commonLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => linkStyle(isActive)}
            >
              {link.name}
            </NavLink>
          ))}

          {role === "teacher" && (
            <div className="mt-2">
              <NavLink
                to="/create-quiz"
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkStyle(isActive)}
              >
                🛠 Manual Quiz
              </NavLink>
            </div>
          )}

          <div className="mt-4">
            <NavLink
              to={classroomLink.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => linkStyle(isActive)}
            >
              🎓 {classroomLink.name}
            </NavLink>
          </div>

          {role === "teacher" && (
            <div className="mt-6 px-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Teacher Mode Active
            </div>
          )}

          {role === "admin" && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Admin
              </div>

              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${baseStyle} ${
                      isActive
                        ? "bg-purple-500/20 text-purple-300 shadow-inner"
                        : "text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="mt-10 px-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full py-2 rounded-xl text-sm bg-white/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}