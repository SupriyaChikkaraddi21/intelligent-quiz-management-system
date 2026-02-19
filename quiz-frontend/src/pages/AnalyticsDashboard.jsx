// src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
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

/* ---------- helpers (UNCHANGED LOGIC) ---------- */

const formatDate = (d) => {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toDateString();
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { displayDate, score } = payload[0].payload;

    return (
      <div className="bg-white rounded-xl px-4 py-2 text-sm shadow-lg border border-slate-200">
        <p className="text-sky-700 font-semibold">{displayDate}</p>
        <p className="text-slate-700">
          Attempt score:{" "}
          <span className="font-bold">
            {score === 0 ? "No correct answers" : `${score}%`}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [aRes, pRes] = await Promise.all([
          api.get("/user/analytics/"),
          api.get("/user/progress/"),
        ]);

        setAnalytics(aRes.data);
        setProgress(Array.isArray(pRes.data) ? pRes.data : []);
      } catch (err) {
        console.error("Analytics load failed:", err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400 animate-fade-in">
        Loading analytics…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-red-400">
        Failed to load analytics
      </div>
    );
  }

  /* ---------- SAFE DATA (UNCHANGED) ---------- */

  const total_quizzes = analytics.total_quizzes ?? 0;
  const average_score = analytics.average_score ?? 0;
  const best_score = analytics.best_score ?? 0;
  const lifetime_accuracy = average_score;
  const avg_time_per_quiz = analytics.avg_time_per_quiz ?? "—";

  const progressData = progress.map((p, i) => ({
    xKey: `${p.date}-${i}`,
    displayDate: formatDate(p.date),
    score: Number(p.score || 0),
  }));

  const difficultyObj = analytics.difficulty_accuracy || {};
  const difficultyData = [
    { name: "easy", value: Number(difficultyObj.easy ?? 0) },
    { name: "medium", value: Number(difficultyObj.medium ?? 0) },
    { name: "hard", value: Number(difficultyObj.hard ?? 0) },
  ];

  const colors = ["#22C55E", "#F59E0B", "#EF4444"];

  /* ---------- STORYTELLING (DERIVED ONLY) ---------- */

  const strongest = [...difficultyData].sort((a, b) => b.value - a.value)[0];
  const weakest = [...difficultyData].sort((a, b) => a.value - b.value)[0];

  const scoreVariance =
    progressData.reduce((acc, p) => acc + Math.abs(p.score - average_score), 0) /
    (progressData.length || 1);

  const consistencyText =
    scoreVariance > 25
      ? "Your scores fluctuate a lot — consistency is the next milestone."
      : "Your performance is stabilizing — keep building momentum.";

  /* ---------- UI ---------- */

  return (
    <div className="relative min-h-screen w-full px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full space-y-10">

        {/* HEADER */}
        <section className="space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-slate-400 max-w-xl">
            Difficulty-wise accuracy, score trends, and learning insights.
          </p>
        </section>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Metric title="Total Quizzes" value={total_quizzes} />
          <Metric title="Average Score" value={`${average_score}%`} secondary />
          <Metric title="Lifetime Accuracy" value={`${lifetime_accuracy}%`} />
          <Metric title="Best Score" value={`${best_score}%`} primary />
          <Metric
            title="Avg Time / Quiz"
            value={`${avg_time_per_quiz}s`}
            subtle
          />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* PRIMARY */}
          <ChartCard
            title="📈 Score Progress"
            subtitle="How your performance evolves over time."
            insight={consistencyText}
            primary
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="xKey" tick={false} />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  dataKey="score"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* SECONDARY */}
          <ChartCard
            title="🎯 Accuracy by Difficulty"
            subtitle="Where you perform best — and where to improve."
            insight={`You're strongest at ${strongest.name} (${strongest.value}%) — ${weakest.name} needs the most improvement.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {difficultyData.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Metric({ title, value, primary, secondary, subtle }) {
  return (
    <div
      className={`rounded-2xl p-6 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        primary
          ? "ring-2 ring-sky-400 scale-[1.03]"
          : secondary
          ? "ring-1 ring-sky-200"
          : ""
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-slate-500">
        {title}
      </div>
      <div
        className={`mt-2 font-bold ${
          primary
            ? "text-4xl text-sky-600"
            : subtle
            ? "text-2xl text-slate-600"
            : "text-3xl text-sky-500"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, insight, children, primary }) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        primary ? "lg:col-span-2 ring-2 ring-sky-300" : ""
      }`}
      style={{ height: primary ? 400 : 360 }}
    >
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-500">{subtitle}</p>
      <p className="mt-2 text-xs text-slate-600 italic">{insight}</p>
      <div className="mt-3 h-[250px]">{children}</div>
    </div>
  );
}
