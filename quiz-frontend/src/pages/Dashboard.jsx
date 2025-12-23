// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import ProgressChartPage from "./ProgressChart";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/user/dashboard/");
        setData(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-300">
        Loading dashboard…
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
  };

  return (
    /* 🔥 THIS IS THE KEY FIX */
    <main className="flex-1 bg-gradient-to-br from-[#050B1A] via-[#060E23] to-[#040814] text-white overflow-y-auto">

      {/* HEADER */}
      <section className="px-10 pt-10 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Learning Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track how your quiz performance evolves over time.
        </p>
      </section>

      {/* KPI CARDS */}
      <section className="px-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-xs uppercase text-slate-400">Latest Score</p>
          <p className="mt-4 text-3xl font-bold">
            {Math.round(data.latest_score ?? 0)}%
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-xs uppercase text-slate-400">Best Score</p>
          <p className="mt-4 text-3xl font-bold">
            {Math.round(data.best_score ?? 0)}%
          </p>
        </div>
      </section>

      {/* SCORE TREND */}
      <section className="px-10 mt-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-medium mb-4">Score Trend</h2>
          <div className="h-[340px]">
            <ProgressChartPage />
          </div>
        </div>
      </section>

      {/* RECENT ATTEMPTS */}
      <section className="px-10 mt-10 pb-14">
        <h2 className="text-lg font-medium mb-4">Recent Attempts</h2>

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-slate-400">Attempt</th>
                <th className="px-6 py-3 text-left text-slate-400">Date</th>
                <th className="px-6 py-3 text-right text-slate-400">Score</th>
                <th className="px-6 py-3 text-right text-slate-400">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {data.recent_scores?.length ? (
                data.recent_scores.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="font-medium">Attempt {i + 1}</div>
                      <div className="text-xs text-slate-400">
                        {r.quiz_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatDate(r.started_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {r.score}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.completed ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No attempts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
