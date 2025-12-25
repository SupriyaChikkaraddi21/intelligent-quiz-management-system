import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

export default function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isTimeout =
    new URLSearchParams(location.search).get("timeout") === "1";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get(`/attempt/${attemptId}/details/`);
        setResult(res.data);

        const a = await api.get(`/attempt/${attemptId}/analytics/`);
        setAnalytics(a.data);

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load results.");
      }
    }

    loadData();
  }, [attemptId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-600">
        Loading results...
      </div>
    );

  if (!result)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-600">
        No result data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white border border-sky-200 shadow-lg rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Quiz Results
        </h1>

        {isTimeout && (
          <div className="text-center mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg font-semibold">
            ⏳ Time is up! Your quiz was auto-submitted.
          </div>
        )}

        <h2 className="text-lg text-center text-slate-600 mb-6">
          {result.quiz_title}
        </h2>

        <div className="text-center mb-10">
          <p className="text-xl font-semibold text-slate-700">
            Your Score:{" "}
            <span className="text-sky-600 font-bold">
              {result.score}%
            </span>
          </p>
        </div>

        {/* ANALYTICS */}
        {analytics && (
          <div className="mb-10 p-6 bg-sky-50 border border-sky-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Performance Analytics
            </h3>

            <p className="text-md mb-3">
              Accuracy:{" "}
              <span className="font-bold text-sky-600">
                {analytics.accuracy}%
              </span>
            </p>

            <div className="mb-4">
              <h4 className="font-semibold text-slate-800 mb-2">
                Difficulty Breakdown
              </h4>

              <div className="space-y-2">
                {Object.entries(analytics.difficulty_breakdown).map(
                  ([diff, stat]) => (
                    <div
                      key={diff}
                      className="p-3 bg-white border border-sky-200 rounded-lg"
                    >
                      <p className="font-semibold capitalize text-slate-800">
                        {diff}
                      </p>
                      <p className="text-sm text-slate-600">
                        Correct: {stat.correct}, Incorrect: {stat.incorrect}
                      </p>
                      <p className="text-sm font-semibold text-sky-600">
                        Accuracy: {stat.accuracy}%
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-slate-800 mb-2">
                Strengths
              </h4>
              <ul className="list-disc ml-6 text-sm text-emerald-600">
                {analytics.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">
                Weak Areas
              </h4>
              <ul className="list-disc ml-6 text-sm text-red-600">
                {analytics.weak_areas.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* QUESTIONS REVIEW */}
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Questions Review
        </h3>

        <div className="space-y-6">
          {result.questions.map((q, i) => {
            const isCorrect = q.selected === q.correct_choice;
            const isUnanswered = q.selected === -1;

            return (
              <div
                key={q.question_id}
                className="p-5 bg-white rounded-xl border border-sky-200 shadow-sm"
              >
                <h4 className="font-semibold text-slate-900 mb-4">
                  Q{i + 1}. {q.question_text}
                </h4>

                <div className="space-y-3">
                  {q.choices.map((choice, index) => {
                    const isCorrectOption = index === q.correct_choice;
                    const isSelected = index === q.selected;

                    let styling =
                      "bg-white border-sky-200 text-slate-800";

                    if (isCorrectOption) {
                      styling =
                        "bg-emerald-50 border-emerald-400 text-emerald-900";
                    }

                    if (isSelected && !isCorrectOption && !isUnanswered) {
                      styling =
                        "bg-red-50 border-red-400 text-red-900";
                    }

                    if (isTimeout && isUnanswered) {
                      styling =
                        "bg-red-50 border-red-300 text-red-900";
                    }

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${styling}`}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>

                {isUnanswered && (
                  <div className="mt-3 text-red-600 font-semibold text-sm">
                    ⚠ Not answered
                  </div>
                )}

                {!isCorrect && !isUnanswered && q.explanation && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                    <h5 className="font-semibold text-amber-800">
                      Explanation
                    </h5>
                    <p className="text-sm text-slate-900 mt-1 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
