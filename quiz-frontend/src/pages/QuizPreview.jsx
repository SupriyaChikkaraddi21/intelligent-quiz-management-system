import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function QuizPreview() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  /* ================= LOAD QUIZ ================= */

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await api.get(`/quiz/${quizId}/edit_details/`);
        setQuiz(res.data);
        setLanguage(res.data.language || "en");
      } catch (err) {
        alert("Failed to load quiz preview");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId, navigate]);

  /* ================= START QUIZ ================= */

  const startQuiz = async () => {
    try {
      const res = await api.post(`/quiz/${quizId}/start/`, {
        quiz_mode: "practice",
        language,
      });
      navigate(`/attempt/${res.data.attempt.id}`);
    } catch {
      alert("Failed to start quiz");
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading quiz preview…
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {quiz.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review questions before starting the quiz
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-slate-700/70 text-slate-200
                       hover:bg-slate-600 transition"
          >
            ← Back
          </button>
        </div>

        {/* META CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Meta label="Category" value={quiz.category} />
          <Meta
            label="Language"
            value={language === "kn" ? "Kannada" : "English"}
          />
          <Meta label="Questions" value={quiz.questions.length} />
          <Meta label="Mode" value="Practice / Challenge" />
        </div>

        {/* QUESTIONS */}
        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-md
                         transition-all duration-300
                         hover:shadow-lg hover:-translate-y-[2px]"
            >
              <p className="font-semibold text-slate-900 mb-3">
                Q{i + 1}. {q.question_text}
              </p>

              {q.question_type === "mcq" && (
                <ul className="space-y-1 text-sm text-slate-700">
                  {q.choices.map((c, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-400">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              {q.question_type === "true_false" && (
                <p className="text-sm text-slate-600">
                  Options: True / False
                </p>
              )}

              {q.question_type === "type_answer" && (
                <p className="text-sm text-slate-600">
                  Answer type: Text input
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-2xl
                       bg-emerald-600 text-white
                       text-xl font-semibold
                       shadow-lg
                       hover:bg-emerald-700
                       hover:shadow-xl
                       hover:-translate-y-[1px]
                       transition-all"
          >
            Start Quiz
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}