import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Classrooms() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;

  const [classrooms, setClassrooms] = useState([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClassrooms();
    }
  }, [user]);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts/classroom/my/");
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    if (role !== "teacher") return;
    if (!name.trim()) return;

    try {
      await api.post("/accounts/classroom/create/", { name });
      setName("");
      loadClassrooms();
    } catch {
      alert("Only teachers can create classrooms");
    }
  };

  const joinClassroom = async () => {
    if (role !== "student") return;
    if (!joinCode.trim()) return;

    try {
      await api.post("/accounts/classroom/join/", { code: joinCode });
      setJoinCode("");
      loadClassrooms();
    } catch {
      alert("Invalid classroom code");
    }
  };

  return (
    <div className="relative min-h-screen w-full px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <section className="space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            {role === "teacher" ? "My Classrooms" : "Joined Classrooms"}
          </h1>

          <p className="text-slate-400">
            {role === "teacher"
              ? "Manage and assign quizzes to your students."
              : "Access quizzes assigned by your teachers."}
          </p>
        </section>

        {/* CREATE / JOIN SECTION */}
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          {role === "teacher" && (
            <div className="flex flex-col md:flex-row gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter classroom name"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={createClassroom}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                Create Classroom
              </button>
            </div>
          )}

          {role === "student" && (
            <div className="flex flex-col md:flex-row gap-4">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter class code"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={joinClassroom}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Join Classroom
              </button>
            </div>
          )}
        </section>

        {/* CLASSROOM LIST */}
        <section>
          {loading ? (
            <div className="text-slate-300">Loading classrooms…</div>
          ) : classrooms.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow text-center">
              <p className="text-slate-600">
                No classrooms yet.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {role === "teacher"
                  ? "Create your first classroom to begin."
                  : "Ask your teacher for a class code to join."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {classrooms.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/classrooms/${c.id}`)}
                  className="group cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-[2px]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Classroom
                      </p>
                      <h2 className="text-xl font-semibold text-slate-800 truncate">
                        {c.name}
                      </h2>
                    </div>

                    <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                      {c.student_count} students
                    </span>
                  </div>

                  {role === "teacher" && (
                    <div className="mt-6">
                      <p className="text-xs uppercase text-slate-500 mb-2">
                        Join Code
                      </p>
                      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg font-mono text-emerald-700 text-sm tracking-wider inline-block">
                        {c.code}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-xs text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Click to open classroom →
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
