import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const commonLinks = [
  { name: "Dashboard", to: "/dashboard" },

  // 🔥 AI Quiz Generation
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
    <aside className="w-64 shrink-0 min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/10 px-4 py-6">
      <nav className="space-y-1">

        {/* ================= COMMON LINKS ================= */}
        {commonLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => linkStyle(isActive)}
          >
            {link.name}
          </NavLink>
        ))}

        {/* ================= MANUAL QUIZ (TEACHER ONLY) ================= */}
        {role === "teacher" && (
          <div className="mt-2">
            <NavLink
              to="/create-quiz"
              className={({ isActive }) => linkStyle(isActive)}
            >
              🛠 Manual Quiz
            </NavLink>
          </div>
        )}

        {/* ================= CLASSROOM ================= */}
        <div className="mt-4">
          <NavLink
            to={classroomLink.to}
            className={({ isActive }) => linkStyle(isActive)}
          >
            🎓 {classroomLink.name}
          </NavLink>
        </div>

        {/* ================= TEACHER LABEL ================= */}
        {role === "teacher" && (
          <div className="mt-6 px-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Teacher Mode Active
          </div>
        )}

        {/* ================= ADMIN SECTION ================= */}
        {role === "admin" && (
          <>
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Admin
            </div>

            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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

      {/* ================= LOGOUT ================= */}
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
  );
}
