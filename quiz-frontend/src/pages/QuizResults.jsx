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
  const [analytics, setAnalytics] = useState(null); // kept so old logic isn't disturbed
  const [pointsInfo, setPointsInfo] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get(`/attempt/${attemptId}/details/`);
        setResult(res.data);
        setPointsInfo(res.data.points || null);
      } catch (err) {
        console.error("Failed to load attempt details:", err);
        setLoading(false);
        return;
      }

      // 🔥 REMOVED broken /analytics/ call
      // Your backend does NOT have this endpoint.
      // Keeping analytics = null so nothing else breaks.
      setAnalytics(null);

      setLoading(false);
    }

    loadData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading results…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        No result data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        <section className="text-center space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Quiz Results
          </h1>
          <p className="text-slate-400">
            {result.quiz_title}
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl text-center">
          {isTimeout && (
            <div className="mb-4 inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              ⏳ Time expired · Auto-submitted
            </div>
          )}

          <p className="text-sm uppercase tracking-widest text-slate-500">
            Your Score
          </p>
          <p className="mt-2 text-6xl font-bold text-sky-600">
            {result.score}%
          </p>

          <p className="mt-2 text-slate-500 text-sm">
            You completed {result.questions.length} questions
          </p>
        </section>

        {pointsInfo ? (
          <section className="rounded-2xl bg-emerald-50 border border-emerald-300 p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              🎯 Points Earned
            </h3>

            <div className="space-y-2 text-sm text-slate-800">
              <Row label="Base Points" value={`+${pointsInfo.base}`} />
              <Row label="Accuracy Bonus" value={`+${pointsInfo.accuracy_bonus}`} />
              <Row label="Speed Bonus" value={`+${pointsInfo.speed_bonus}`} />
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-300 flex justify-between font-semibold">
              <span>Total Points</span>
              <span className="text-emerald-700">
                +{pointsInfo.total}
              </span>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-slate-700/40 border border-slate-600 p-6 text-slate-300 text-sm">
             Practice mode is for skill-building. Switch to Challenge mode to earn leaderboard points.

          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Questions Review
          </h2>

          <div className="space-y-6">
            {result.questions.map((q, i) => {
              const isTypeAnswer = q.question_type === "type_answer";
              const isUnanswered = isTypeAnswer
                ? !q.text_answer
                : q.selected === null || q.selected === undefined;

              return (
                <div
                  key={q.question_id}
                  className="rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
                >
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Q{i + 1}. {q.question_text}
                  </h3>

                  {!isTypeAnswer && (
                    <div className="space-y-2">
                      {q.choices.map((choice, index) => {
                        const isCorrect = index === q.correct_choice;
                        const isSelected = index === q.selected;

                        let cls = "border border-slate-200 bg-white";

                        if (isCorrect)
                          cls = "border-emerald-400 bg-emerald-50";
                        else if (isSelected)
                          cls = "border-red-400 bg-red-50";

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-xl text-sm ${cls}`}
                          >
                            {choice}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isTypeAnswer && (
                    <div className="space-y-3">
                      <AnswerBlock
                        label="Your Answer"
                        value={q.text_answer || "—"}
                        variant="neutral"
                      />
                      {q.correct_text && (
                        <AnswerBlock
                          label="Correct Answer"
                          value={q.correct_text}
                          variant="success"
                        />
                      )}
                    </div>
                  )}

                  {isUnanswered && (
                    <p className="mt-3 text-sm font-semibold text-red-600">
                      ⚠ Not answered
                    </p>
                  )}

                  {q.explanation && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-300 p-4">
                      <p className="font-semibold text-amber-800">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-800 mt-1">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button
            onClick={() =>
              navigate(`/select?retake=${result.quiz_id}`)
            }
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-700 hover:shadow-lg transition"
          >
            Retake Quiz
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold
                       hover:bg-sky-700 hover:shadow-lg transition"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function AnswerBlock({ label, value, variant }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
      : "bg-slate-50 border-slate-300 text-slate-900";

  return (
    <div className={`p-4 rounded-xl border ${styles}`}>
      <p className="text-xs uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
