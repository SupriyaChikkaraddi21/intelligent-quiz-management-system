// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";


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
      <div className="flex-1 flex items-center justify-center text-slate-500">
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
    <main className="flex-1 bg-gradient-to-br from-white via-sky-50 to-sky-100
                     text-slate-800 overflow-y-auto">

      {/* HEADER */}
      <section className="px-10 pt-10 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Your Learning Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Track how your quiz performance evolves over time.
        </p>
      </section>

      {/* KPI CARDS */}
      <section className="px-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-sky-200 p-6">
          <p className="text-xs uppercase text-slate-500">Latest Score</p>
          <p className="mt-4 text-3xl font-bold text-sky-600">
            {Math.round(data.latest_score ?? 0)}%
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-sky-200 p-6">
          <p className="text-xs uppercase text-slate-500">Best Score</p>
          <p className="mt-4 text-3xl font-bold text-sky-600">
            {Math.round(data.best_score ?? 0)}%
          </p>
        </div>
      </section>

      {/* SCORE TREND
      <section className="px-10 mt-8">
        <div className="rounded-2xl bg-white border border-sky-200 p-6">
          <h2 className="text-lg font-medium mb-4 text-slate-900">
            Score Trend
          </h2>
          <div className="h-[340px]">
            <ProgressChartPage />
          </div>
        </div>
      </section> */}

      {/* RECENT ATTEMPTS */}
      <section className="px-10 mt-10 pb-14">
        <h2 className="text-lg font-medium mb-4 text-slate-900">
          Recent Attempts
        </h2>

        <div className="rounded-2xl bg-white border border-sky-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-3 text-left text-slate-600">Attempt</th>
                <th className="px-6 py-3 text-left text-slate-600">Date</th>
                <th className="px-6 py-3 text-right text-slate-600">Score</th>
                <th className="px-6 py-3 text-right text-slate-600">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-sky-200">
              {data.recent_scores?.length ? (
                data.recent_scores.map((r, i) => (
                  <tr key={i} className="hover:bg-sky-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium">Attempt {i + 1}</div>
                      <div className="text-xs text-slate-500">
                        {r.quiz_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(r.started_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {r.score}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.completed ? (
                        <span className="px-3 py-1 rounded-full
                                         bg-emerald-100 text-emerald-600 text-xs">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full
                                         bg-amber-100 text-amber-600 text-xs">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
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
