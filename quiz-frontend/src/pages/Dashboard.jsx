import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dash, diff, game] = await Promise.all([
          api.get("/user/dashboard/"),
          api.get("/user/difficulty/"),
          api.get("/user/gamification/"),
        ]);

        setData(dash.data);
        setDifficulty(diff.data);
        setGamification(game.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading your dashboard…
      </div>
    );
  }

  const latestScore = data?.latest_score ?? 0;
  const bestScore = data?.best_score ?? 0;
  const attempts = data?.recent_attempts || [];

  const level = gamification?.level || "Beginner";
  const nextLevel = gamification?.next_level;
  const remaining = gamification?.remaining_for_next ?? 0;
  const streak = gamification?.current_streak ?? 0;
  const points = gamification?.points ?? 0;
  const badges = gamification?.badges || [];

  return (
    <main className="relative min-h-screen w-full px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_40%)] pointer-events-none" />

      <div className="relative w-full space-y-10">

        {/* HEADER */}
        <section className="space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Learning Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Track progress, performance, and consistency.
          </p>

          <div className="pt-4 flex gap-3">
            <SecondaryButton onClick={() => navigate("/my-quizzes")}>
              My Quizzes
            </SecondaryButton>
            <PrimaryButton onClick={() => navigate("/create")}>
              + Create Quiz
            </PrimaryButton>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="grid md:grid-cols-4 gap-6">
          <KPI
            icon="📊"
            title="Latest Score"
            value={`${latestScore}%`}
            progress={latestScore}
            color="sky"
            hint="Based on your last quiz"
          />
          <KPI
            icon="🏆"
            title="Best Score"
            value={`${bestScore}%`}
            progress={bestScore}
            color="emerald"
            hint="Your highest performance"
          />
          <KPI
            icon="🪙"
            title="Reward Points"
            value={points}
            progress={points % 100}
            color="amber"
            hint="Earn more by practicing"
          />
          <KPI
            icon="🔥"
            title="Daily Streak"
            value={`${streak} days`}
            progress={Math.min(streak * 10, 100)}
            color="orange"
            hint="Consistency matters"
          />
        </section>

        {/* AI NEXT STEP */}
        <section>
          <div className="rounded-2xl bg-slate-100/90 backdrop-blur-md p-8 flex items-center justify-between border border-slate-200 shadow-xl transition hover:shadow-2xl">
            <div>
              <p className="text-xs uppercase text-slate-500">
                AI Recommended Next Step
              </p>
              <p className="mt-2 text-2xl font-bold text-indigo-600 capitalize">
                {difficulty?.difficulty || "Easy"} Quiz
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {difficulty?.reason || "Not enough data yet"}
              </p>
            </div>

            <PrimaryButton onClick={() => navigate("/select")}>
              Start Now →
            </PrimaryButton>
          </div>
        </section>

        {/* LEVEL & MOTIVATION */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card>
            <p className="text-xs uppercase text-slate-500 mb-2">
              Your Level
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {level}
            </p>

            {nextLevel && (
              <p className="text-xs text-slate-500 mt-1">
                {remaining} quizzes to reach{" "}
                <span className="font-semibold">{nextLevel}</span>
              </p>
            )}

            <div className="mt-4 flex gap-2 flex-wrap">
              {badges.length ? (
                badges.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-sky-100 text-sky-700"
                  >
                    🏅 {b}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  No badges yet
                </span>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase text-slate-500 mb-2">
              Motivation
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {streak >= 5
                ? "🔥 You’re on fire. Keep going!"
                : "Consistency beats intensity."}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Practice daily to level up faster.
            </p>
          </Card>
        </section>

        {/* RECENT ATTEMPTS */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-white">
            Recent Attempts
          </h2>

          <div className="rounded-2xl bg-slate-100/95 backdrop-blur-md shadow-xl overflow-hidden border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-200/70 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left">Quiz</th>
                  <th className="px-6 py-3 text-center">Date</th>
                  <th className="px-6 py-3 text-right">Score</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {attempts.length ? (
                  attempts.map((a, i) => (
                    <tr
                      key={i}
                      onClick={() =>
                        navigate(
                          a.completed
                            ? `/results/${a.attempt_id}`
                            : `/attempt/${a.attempt_id}`
                        )
                      }
                      className="cursor-pointer transition hover:bg-slate-200/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          Attempt {i + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                          {a.quiz_title}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {new Date(a.date).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ScorePill score={a.score} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        {a.completed ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      No attempts yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- COMPONENTS ---------- */

function KPI({ icon, title, value, progress, color, hint }) {
  const colors = {
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="rounded-2xl bg-slate-100/90 backdrop-blur-md border border-slate-200 p-6 shadow-lg transition hover:shadow-xl">
      <p className="text-xs uppercase text-slate-500 flex items-center gap-2">
        <span>{icon}</span> {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-1">{hint}</p>

      <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-2xl bg-slate-100/90 backdrop-blur-md border border-slate-200 p-6 shadow-lg transition hover:shadow-xl">
      {children}
    </div>
  );
}

function ScorePill({ score }) {
  const style =
    score >= 75
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
      ? "bg-sky-100 text-sky-700"
      : "bg-rose-100 text-rose-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {score}%
    </span>
  );
}

/* ---------- BUTTONS ---------- */

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
    >
      {children}
    </button>
  );
}
