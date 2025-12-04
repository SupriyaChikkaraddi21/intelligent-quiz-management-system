import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

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

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#1F3A5F] mb-2">
          Quiz Results
        </h1>

        {/* Quiz Title */}
        <h2 className="text-lg text-center text-[#64748B] mb-6">
          {result.quiz_title}
        </h2>

        {/* Score */}
        <div className="text-center mb-10">
          <p className="text-xl font-semibold text-[#1E293B]">
            Your Score:{" "}
            <span className="text-[#1F3A5F] font-bold">{result.score}%</span>
          </p>
        </div>

        {/* Review Header */}
        <h3 className="text-xl font-bold text-[#1E293B] mb-4">
          Questions Review
        </h3>

        {/* Questions */}
        <div className="space-y-6">
          {result.questions.map((q, i) => (
            <div
              key={q.question_id}
              className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <h4 className="font-semibold text-[#1E293B] mb-4">
                Q{i + 1}. {q.question_text}
              </h4>

              <div className="space-y-3">
                {q.choices.map((choice, index) => {
                  const isCorrect = index === q.correct_choice;
                  const isSelected = index === q.selected;

                  let styling = "bg-white border-gray-300";

                  if (isCorrect) {
                    styling = "bg-green-100 border-green-500";
                  } else if (isSelected && !isCorrect) {
                    styling = "bg-red-100 border-red-500";
                  }

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${styling} transition`}
                    >
                      {choice}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
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
