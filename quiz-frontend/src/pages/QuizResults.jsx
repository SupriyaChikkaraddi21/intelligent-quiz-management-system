import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

export default function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect timeout from URL (?timeout=1)
  const isTimeout = new URLSearchParams(location.search).get("timeout") === "1";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await api.get(`/attempt/${attemptId}/details/`);
        setResult(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load results.");
      }
    }

    loadResult();
  }, [attemptId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading results...
      </div>
    );

  if (!result)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        No result data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-2xl p-8">

        {/* MAIN TITLE */}
        <h1 className="text-3xl font-bold text-center text-[#1F3A5F] mb-2">
          Quiz Results
        </h1>

        {/* TIMEOUT BANNER */}
        {isTimeout && (
          <div className="text-center mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg font-semibold">
            ⏳ Your quiz was submitted automatically because time ran out.
          </div>
        )}

        {/* QUIZ TITLE */}
        <h2 className="text-lg text-center text-[#64748B] mb-6">
          {result.quiz_title}
        </h2>

        {/* SCORE */}
        <div className="text-center mb-10">
          <p className="text-xl font-semibold text-[#1E293B]">
            Your Score:{" "}
            <span className="text-[#1F3A5F] font-bold">{result.score}%</span>
          </p>
        </div>

        {/* REVIEW HEADER */}
        <h3 className="text-xl font-bold text-[#1E293B] mb-4">
          Questions Review
        </h3>

        {/* QUESTIONS */}
        <div className="space-y-6">
          {result.questions.map((q, i) => {
            const isCorrect = q.selected === q.correct_choice;
            const isUnanswered = q.selected === -1; // ⭐ UNANSWERED DETECTION

            return (
              <div
                key={q.question_id}
                className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* QUESTION TEXT */}
                <h4 className="font-semibold text-[#1E293B] mb-4">
                  Q{i + 1}. {q.question_text}
                </h4>

                {/* OPTIONS */}
                <div className="space-y-3">
                  {q.choices.map((choice, index) => {
                    const isCorrectOption = index === q.correct_choice;
                    const isSelected = index === q.selected;

                    let styling = "bg-white border-gray-300";

                    if (isCorrectOption) {
                      styling = "bg-green-100 border-green-500";
                    }

                    if (isSelected && !isCorrectOption && !isUnanswered) {
                      styling = "bg-red-100 border-red-500";
                    }

                    // ⭐ If timeout unanswered -> mark all options neutral
                    if (isUnanswered && isTimeout) {
                      styling = "bg-red-50 border-red-400";
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

                {/* ⭐ UNANSWERED LABEL */}
                {isUnanswered && isTimeout && (
                  <div className="mt-3 text-red-600 font-semibold text-sm">
                    ⚠ Not answered (Time Up)
                  </div>
                )}

                {/* WRONG ATTEMPT EXPLANATION (only if attempted & wrong) */}
                {!isUnanswered && !isCorrect && q.explanation && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <h5 className="font-semibold text-yellow-800">Explanation</h5>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BACK BUTTON */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-[#1F3A5F] text-white rounded-lg hover:bg-[#162b46] transition font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
