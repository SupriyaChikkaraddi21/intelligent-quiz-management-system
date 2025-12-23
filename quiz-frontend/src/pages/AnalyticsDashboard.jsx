// src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import api from "../api/api";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/analytics/");
        setData(res.data);
      } catch {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white text-lg">
        Loading analytics…
      </div>
    );
  }

  const {
    total_quizzes,
    average_score,
    lifetime_accuracy,
    progress_graph = [],
    difficulty_accuracy = {},
    recommendations = [],
  } = data || {};

  const progressData = progress_graph.map((p) => ({
    date: p.date,
    score: Number(p.score || 0),
  }));

  const difficultyData = [
    { name: "Easy", value: difficulty_accuracy.easy || 0 },
    { name: "Medium", value: difficulty_accuracy.medium || 0 },
    { name: "Hard", value: difficulty_accuracy.hard || 0 },
  ];

  const colors = ["#22C55E", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white font-sans px-10 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Deep insights into your performance, strengths, and learning patterns.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          Back
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Quizzes", value: total_quizzes },
          { label: "Average Score", value: `${average_score}%` },
          { label: "Lifetime Accuracy", value: `${lifetime_accuracy}%` },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400">
              {item.label}
            </div>
            <div className="mt-2 text-3xl font-bold">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* SCORE TREND */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Score Progress</h2>

          {progressData.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer>
                <LineChart data={progressData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#38BDF8"
                    strokeWidth={3}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No score data yet.</p>
          )}
        </div>

        {/* DIFFICULTY */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Accuracy by Difficulty</h2>

          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={difficultyData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value">
                  {difficultyData.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Focus more on levels with lower accuracy.
          </p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold mb-3">Recommendations</h2>

        <ul className="list-disc ml-5 space-y-2 text-sm text-slate-300">
          {recommendations.length ? (
            recommendations.map((r, i) => <li key={i}>{r}</li>)
          ) : (
            <li>Keep practicing consistently to improve accuracy.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
