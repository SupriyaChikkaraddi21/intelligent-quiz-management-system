import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function MyQuizzes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);

  const [language] = useState("en");

  /* ================= LOAD MY QUIZZES ================= */

  useEffect(() => {
    async function load() {
      try {
        // ✅ FIXED ENDPOINT
        const res = await api.get("/quiz-management/my_quizzes/");
        setQuizzes(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your quizzes");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= ACTIONS ================= */

  const startQuiz = async (quizId) => {
    try {
      // ✅ FIXED ENDPOINT (NEW ATTEMPT ARCHITECTURE)
      const res = await api.post("/attempt/start/", {
        quiz_id: quizId,
        mode: "practice",
        language,
      });

      const attemptId = res.data.attempt_id;
      navigate(`/attempt/${attemptId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz");
    }
  };

  const editQuiz = (quizId) => {
    navigate(`/create-quiz?edit=${quizId}`);
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        Loading your quizzes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen w-full px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-10">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              My Quizzes
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Create, edit, and practice your quizzes anytime.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-quiz")}
            className="
              px-5 py-2.5 rounded-xl
              bg-sky-500 text-white font-semibold
              shadow-md
              hover:bg-sky-600 hover:shadow-lg hover:-translate-y-[1px]
              active:scale-[0.98]
              transition-all
            "
          >
            + Create Quiz
          </button>
        </div>

        {quizzes.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
            <p className="text-xl font-semibold text-slate-800 mb-2">
              No quizzes yet
            </p>
            <p className="text-slate-500 mb-6">
              Create your first quiz and test your knowledge.
            </p>
            <button
              onClick={() => navigate("/create-quiz")}
              className="
                px-6 py-2.5 rounded-xl
                bg-emerald-600 text-white font-semibold
                hover:bg-emerald-700
                transition
              "
            >
              Create First Quiz
            </button>
          </div>
        )}

        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => {
              const attempts = quiz.attempts || 0;

              return (
                <div
                  key={quiz.id}
                  className="
                    relative rounded-3xl bg-white p-6
                    shadow-md
                    transition-all duration-300
                    hover:shadow-xl hover:-translate-y-1
                  "
                >
                  <div className="absolute top-5 right-5 text-xs">
                    <span
                      className={`
                        px-2.5 py-1 rounded-full font-semibold
                        ${
                          attempts > 0
                            ? "bg-sky-100 text-sky-600"
                            : "bg-emerald-100 text-emerald-600"
                        }
                      `}
                    >
                      {attempts > 0 ? "Practiced" : "Draft"}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    {quiz.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Difficulty:{" "}
                    <span className="capitalize font-medium text-slate-700">
                      {quiz.difficulty}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Attempts: {attempts}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => startQuiz(quiz.id)}
                      className="
                        flex-1 rounded-xl px-4 py-2.5 font-semibold
                        bg-emerald-600 text-white
                        hover:bg-emerald-700 shadow
                        transition
                      "
                    >
                      Start
                    </button>

                    <button
                      onClick={() => editQuiz(quiz.id)}
                      className="
                        flex-1 rounded-xl px-4 py-2.5 font-semibold
                        bg-slate-100 text-slate-700
                        hover:bg-slate-200
                        transition
                      "
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
