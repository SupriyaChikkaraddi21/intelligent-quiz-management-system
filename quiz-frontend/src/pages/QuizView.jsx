import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";

export default function QuizView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get("classroom");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) {
      alert("Quiz not specified");
      return;
    }
    fetchStats();
  }, [quizId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/quiz-teacher/${quizId}/teacher_stats/`
      );

      setData(res.data);
    } catch (err) {
      console.error("Teacher stats error:", err);
      alert("Failed to load quiz stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading quiz analytics…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        No data found.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <section className="space-y-3">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            {data.title}
          </h1>

          <p className="text-slate-400">
            Teacher view · Classroom performance overview
          </p>

          {/* Stats Card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Attempts"
              value={data.total_attempts}
              color="indigo"
            />

            <StatCard
              label="Quiz Difficulty"
              value={data.difficulty || "—"}
              color="sky"
            />

            <StatCard
              label="Students Attempted"
              value={data.students?.length || 0}
              color="emerald"
            />
          </div>
        </section>

        {/* STUDENT ATTEMPTS */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Student Attempts
          </h2>

          {data.students?.length === 0 ? (
            <div className="rounded-2xl bg-white/90 p-8 text-center shadow">
              <p className="text-slate-500">
                No students have attempted this quiz yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {data.students.map((s) => (
                <div
                  key={s.attempt_id}
                  onClick={() =>
                    navigate(
                      `/results/${s.attempt_id}?teacher=1${
                        classroomId ? `&classroom=${classroomId}` : ""
                      }`
                    )
                  }
                  className="group cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-[2px]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm uppercase text-slate-500">
                        Student
                      </p>
                      <p className="text-lg font-semibold text-slate-800 truncate">
                        {s.student_name}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        s.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {s.completed ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <Info label="Score" value={`${s.score}%`} />
                    <Info label="Points" value={s.total_points} />
                    <Info label="Mode" value={s.quiz_mode} />
                  </div>

                  <div className="mt-6 text-xs text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Click to view detailed results →
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

/* ================= UI COMPONENTS ================= */

function StatCard({ label, value, color }) {
  const colorMap = {
    indigo: "text-indigo-600",
    sky: "text-sky-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg text-center">
      <p className="text-xs uppercase text-slate-500 tracking-wider">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">
        {label}
      </p>
      <p className="font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}
