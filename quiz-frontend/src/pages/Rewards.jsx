import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function Rewards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const res = await api.get("/rewards/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load rewards", err);
    } finally {
      setLoading(false);
    }
  }

  async function redeem(reward) {
    try {
      await api.post("/rewards/redeem/", { code: reward.code });
      loadRewards();
    } catch (err) {
      alert(err.response?.data?.error || "Cannot redeem reward");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading rewards…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400">
        No rewards available.
      </div>
    );
  }

  /* ---------- STORYTELLING (DERIVED ONLY) ---------- */

  const lockedRewards = data.rewards.filter((r) => !r.unlocked);
  const nextReward = lockedRewards.sort((a, b) => a.cost - b.cost)[0];

  return (
    <div className="relative min-h-screen w-full px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full space-y-10">

        {/* HEADER */}
        <section className="space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Rewards
          </h1>
          <p className="text-slate-400 max-w-xl">
            Turn your progress into powerful unlocks.
          </p>
        </section>

        {/* POINTS HERO */}
        <section className="rounded-2xl bg-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Available Points
            </p>
            <p className="mt-2 text-4xl font-bold text-indigo-600">
              🪙 {data.points}
            </p>

            {nextReward && (
              <p className="mt-2 text-sm text-slate-500">
                Next unlock:{" "}
                <span className="font-medium text-slate-700">
                  {nextReward.label}
                </span>{" "}
                ({Math.max(nextReward.cost - data.points, 0)} pts to go)
              </p>
            )}
          </div>

          <div className="text-sm text-slate-500 max-w-sm">
            Earn points by completing quizzes, maintaining streaks,
            and improving accuracy. Spend them to unlock advanced features.
          </div>
        </section>

        {/* REWARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.rewards.map((r) => (
            <div
              key={r.code}
              className={`
                relative rounded-2xl p-6 bg-white
                transform-gpu transition-all duration-300
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                  r.unlocked
                    ? "border border-emerald-200 shadow-md"
                    : `
                      shadow-md
                      hover:-translate-y-2
                      hover:shadow-2xl
                      hover:ring-1 hover:ring-indigo-300
                      active:scale-[0.97]
                    `
                }
              `}
            >
              {/* LIFT GLOW */}
              {!r.unlocked && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100 bg-gradient-to-br from-indigo-100/40 to-transparent" />
              )}

              {/* STATUS BADGE */}
              <div className="absolute top-4 right-4 text-xs">
                {r.unlocked ? (
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                    Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    Locked
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h2 className="text-lg font-semibold text-slate-900">
                {r.label}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cost: {r.cost} points
              </p>

              {/* ACTION */}
              {r.unlocked ? (
                <div className="mt-6 text-sm text-emerald-600 font-medium">
                  ✓ You’ve unlocked this reward
                </div>
              ) : (
                <button
                  onClick={() => redeem(r)}
                  disabled={data.points < r.cost}
                  className={`mt-6 w-full rounded-xl px-4 py-2.5 font-semibold transition
                    ${
                      data.points >= r.cost
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  Redeem
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}