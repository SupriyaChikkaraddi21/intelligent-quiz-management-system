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
  Legend,
} from "recharts";
import api from "../api/api";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/quiz/user/analytics/");
        if (cancelled) return;
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics. Try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );

  const {
    total_quizzes,
    average_score,
    lifetime_accuracy,
    progress_graph,
    difficulty_accuracy,
    recommendations,
  } = data;

  // Format progress_graph to recharts-friendly (guard)
  const progressData =
    Array.isArray(progress_graph) && progress_graph.length
      ? progress_graph.map((p) => ({ date: p.date, score: Number(p.score || 0) }))
      : [];

  // Difficulty bar data
  const difficultyData = [
    { name: "easy", accuracy: difficulty_accuracy.easy || 0 },
    { name: "medium", accuracy: difficulty_accuracy.medium || 0 },
    { name: "hard", accuracy: difficulty_accuracy.hard || 0 },
  ];

  const barColors = {
    easy: "#10B981", // green
    medium: "#F59E0B", // amber
    hard: "#EF4444", // red
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of your learning progress and strengths — powered by adaptive quizzes.
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-[#1F3A5F] text-white rounded-lg hover:bg-[#162b46]"
            >
              Back
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <div className="text-sm text-gray-500">Total quizzes</div>
            <div className="text-2xl font-bold text-[#0F172A]">{total_quizzes}</div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <div className="text-sm text-gray-500">Average score</div>
            <div className="text-2xl font-bold text-[#0F172A]">{average_score}%</div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <div className="text-sm text-gray-500">Lifetime accuracy</div>
            <div className="text-2xl font-bold text-[#0F172A]">{lifetime_accuracy}%</div>
          </div>
        </div>

        {/* Charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Score progress line */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Score Progress</h3>
            {progressData.length ? (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={progressData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No progress data yet.</div>
            )}
          </div>

          {/* Difficulty accuracy bars */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Difficulty Accuracy</h3>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={difficultyData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#8884d8" barSize={18}>
                    {difficultyData.map((entry) => (
                      <Cell key={entry.name} fill={barColors[entry.name] || "#8884d8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Accuracy per difficulty gives quick indication where to focus practice.
            </div>
          </div>
        </div>

        {/* Recommendations + details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 p-4 bg-white rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Recommendations</h3>
            <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
              {Array.isArray(recommendations) && recommendations.length ? (
                recommendations.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li>No recommendations right now.</li>
              )}
            </ul>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Quick tips</h3>
            <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-2">
              <li>Review explanations for incorrect answers.</li>
              <li>Do short medium-level quizzes daily for retention.</li>
              <li>Target fundamentals before attempting many hard quizzes.</li>
            </ol>
          </div>
        </div>

        {/* Footer / actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate("/create-quiz")}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            Create Practice Quiz
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-[#1F3A5F] text-white rounded-lg hover:bg-[#162b46]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
