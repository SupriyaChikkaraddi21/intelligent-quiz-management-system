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
  CartesianGrid,
} from "recharts";
import api from "../api/api";

/* ---------- helpers ---------- */

const formatDate = (d) => {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toDateString();
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { displayDate, score } = payload[0].payload;
    return (
      <div className="bg-white border border-sky-200 rounded-lg px-3 py-2 text-sm shadow">
        <p className="text-sky-700 font-medium">{displayDate}</p>
        <p className="text-slate-700">
          Score: <span className="font-semibold">{score}%</span>
        </p>
      </div>
    );
  }
  return null;
};

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
      <div className="min-h-screen flex items-center justify-center
                      bg-white text-slate-600 text-lg">
        Loading analytics…
      </div>
    );
  }

  const {
    total_quizzes = 0,
    average_score = 0,
    lifetime_accuracy = 0,
    progress_graph = [],
    difficulty_accuracy = {},
    recommendations = [],
  } = data || {};

  /* ---------- FIXED PROGRESS DATA ---------- */
  const progressData = progress_graph.map((p, i) => ({
    xKey: `${p.date}-${i}`,     // unique X
    displayDate: formatDate(p.date),
    score: Number(p.score || 0),
  }));

  /* ---------- FIXED DIFFICULTY DATA ---------- */
  const difficultyData = [
    { name: "Easy", value: Number(difficulty_accuracy.easy ?? 0) },
    { name: "Medium", value: Number(difficulty_accuracy.medium ?? 0) },
    { name: "Hard", value: Number(difficulty_accuracy.hard ?? 0) },
  ];

  const colors = ["#22C55E", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100
                    text-slate-800 font-sans px-10 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Deep insights into your performance, strengths, and learning patterns.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-sm rounded-lg
                     bg-sky-100 text-slate-700
                     hover:bg-sky-200 transition"
        >
          Back
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Total Quizzes
          </div>
          <div className="mt-2 text-3xl font-bold text-sky-600">
            {total_quizzes}
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Average Score
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-600">
            {average_score}%
          </div>
        </div>

        <div className="rounded-2xl bg-violet-50 border border-violet-200 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Lifetime Accuracy
          </div>
          <div className="mt-2 text-3xl font-bold text-violet-600">
            {lifetime_accuracy}%
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* SCORE TREND */}
        <div className="rounded-2xl bg-white border border-sky-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Score Progress
          </h2>

          {progressData.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis
                    dataKey="xKey"
                    tickFormatter={(v) => v.split("-")[0]}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="linear"
                    dataKey="score"
                    stroke="#0EA5E9"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No score data yet.</p>
          )}
        </div>

        {/* DIFFICULTY */}
        <div className="rounded-2xl bg-white border border-sky-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Accuracy by Difficulty
          </h2>

          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={difficultyData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="value">
                  {difficultyData.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Focus more on levels with lower accuracy.
          </p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
        <h2 className="text-lg font-semibold mb-3 text-slate-900">
          Recommendations
        </h2>

        <ul className="list-disc ml-5 space-y-2 text-sm text-slate-700">
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
