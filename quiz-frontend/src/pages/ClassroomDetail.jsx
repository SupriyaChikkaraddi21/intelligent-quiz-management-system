import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ClassroomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false); // ✅ NEW

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);

      const classroomRes = await api.get(`/accounts/classroom/${id}/`);
      const classroomData = classroomRes.data;
      setClassroom(classroomData);

      const assignmentRes = await api.get(
        `/quiz/classroom/${id}/assignments/`
      );
      setAssignments(assignmentRes.data);

      if (classroomData.role === "teacher") {
        const quizRes = await api.get(`/quiz-management/`);
        setMyQuizzes(quizRes.data);
      }

    } catch (err) {
      console.error("Failed to load classroom:", err);
      alert("Failed to load classroom");
    } finally {
      setLoading(false);
    }
  };

  const assignQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      await api.post(`/quiz/assign/`, {
        classroom_id: id,
        quiz_id: selectedQuiz,
      });

      setSelectedQuiz("");
      loadAll();
    } catch (err) {
      console.error("Assign failed:", err);
      alert("Failed to assign quiz");
    }
  };

  const startQuiz = async (quizId) => {
    if (!quizId) {
      alert("Invalid quiz ID");
      return;
    }

    try {
      const res = await api.post(
        `/quiz/${quizId}/start/`,
        { quiz_mode: "challenge" }
      );

      if (!res.data.attempt_id) {
        alert("Invalid response from server");
        return;
      }

      navigate(`/attempt/${res.data.attempt_id}`);
    } catch (err) {
      console.error("Start failed:", err);
      alert("Failed to start quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading classroom…
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Classroom not found
      </div>
    );
  }

  const isTeacher = classroom.role === "teacher";
  const isStudent = classroom.role === "student";

  return (
    <div className="relative min-h-screen w-full px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-12">

        {/* ================= HEADER ================= */}
        <section className="space-y-4">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            {classroom.name}
          </h1>

          {isTeacher && (
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase text-slate-400 tracking-widest">
                Class Code
              </span>

              <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                <span className="px-5 py-2 font-mono text-emerald-700 tracking-widest text-sm">
                  {classroom.code}
                </span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(classroom.code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className={`px-4 py-2 text-xs font-semibold transition-all ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ================= TEACHER ASSIGN SECTION ================= */}
        {isTeacher && (
          <section className="rounded-3xl bg-white p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                Assign Quiz
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select one of your created quizzes and assign it to this classroom.
              </p>
            </div>

            {myQuizzes.length === 0 ? (
              <div className="space-y-4">
                <p className="text-slate-500">
                  You have no quizzes created yet.
                </p>

                <button
                  onClick={() => navigate(`/create-quiz?classroom=${id}`)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold shadow"
                >
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select quiz</option>
                  {myQuizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={assignQuiz}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold shadow"
                >
                  Assign
                </button>
              </div>
            )}
          </section>
        )}

        {/* ================= ASSIGNED QUIZZES ================= */}
        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              Assigned Quizzes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Students can attempt these quizzes.
            </p>
          </div>

          {assignments.length === 0 ? (
            <p className="text-slate-500">
              No quizzes assigned yet.
            </p>
          ) : (
            <div className="space-y-5">
              {assignments.map((a) => {
                const quizId = a.quiz_id;

                return (
                  <div
                    key={a.id}
                    className="group p-6 rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-[2px] transition-all flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs uppercase text-slate-400 tracking-widest">
                        Quiz
                      </p>
                      <p className="font-semibold text-slate-800 text-lg">
                        {a.quiz_title || "Untitled Quiz"}
                      </p>
                    </div>

                    {isStudent && (
                      <button
                        onClick={() => startQuiz(quizId)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold shadow"
                      >
                        Start
                      </button>
                    )}

                    {isTeacher && (
                      <button
                        onClick={() =>
                          navigate(`/quiz-view/${quizId}?classroom=${id}`)
                        }
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold"
                      >
                        View Results
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
