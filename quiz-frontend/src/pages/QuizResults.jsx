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
        const res = await api.get(`/attempts/${attemptId}/details/`);
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
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4">Quiz Results</h1>

        {/* Quiz Title */}
        <h2 className="text-xl text-center font-semibold text-gray-700 mb-6">
          {result.quiz_title}
        </h2>

        {/* Score */}
        <div className="text-center mb-10">
          <p className="text-2xl font-bold">
            Your Score:{" "}
            <span className="text-blue-600">{result.score}%</span>
          </p>
        </div>

        {/* Review Section */}
        <h3 className="text-xl font-bold mb-4">Questions Review</h3>

        <div className="space-y-6">
          {result.questions.map((q, index) => (
            <div
              key={q.question_id}
              className="p-5 rounded-lg border bg-gray-50"
            >
              <h4 className="font-semibold mb-3">
                Q{index + 1}. {q.question_text}
              </h4>

              {/* Choices */}
              <div className="space-y-2">
                {q.choices.map((choice, i) => {
                  const isCorrect = i === q.correct_choice;
                  const isSelected = i === q.selected;

                  return (
                    <p
                      key={i}
                      className={`p-3 rounded-lg border ${
                        isCorrect
                          ? "bg-green-100 border-green-400"
                          : isSelected
                            ? "bg-red-100 border-red-400"
                            : "bg-white border-gray-300"
                      }`}
                    >
                      {choice}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
