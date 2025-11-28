import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import ProgressChartPage from "./ProgressChart";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/quizzes/dashboard/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
        alert("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        No dashboard data.
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="text-gray-600">Total Quizzes</div>
          <div className="text-3xl font-bold mt-2">{data.total_quizzes}</div>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <div className="text-gray-600">Average Score</div>
          <div className="text-3xl font-bold mt-2">
            {Math.round(data.avg_score || 0)}%
          </div>
        </div>
      </div>

      {/* Recent Scores */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-3">Recent Scores</h2>

        <div className="bg-white shadow rounded-xl p-5">
          {(data.recent_scores || []).length === 0 ? (
            <p className="text-gray-500">No recent results</p>
          ) : (
            <ul className="list-disc ml-5 space-y-2">
              {data.recent_scores.map((r, i) => (
                <li key={i}>
                  {r.started_at
                    ? new Date(r.started_at).toLocaleString()
                    : "Unknown"}{" "}
                  — <strong>{r.score}%</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => navigate("/select")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Quiz
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Leaderboard
        </button>

        <button
          onClick={() => navigate("/progress")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Progress
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg hover:bg-red-200"
        >
          Logout
        </button>
      </div>

      {/* Score Progress Chart */}
      <h2 className="text-xl font-bold mb-3">Your Score Progress</h2>

      <div className="bg-white shadow rounded-xl p-4">
        <div className="w-full h-[350px]">
          <ProgressChartPage />
        </div>
      </div>
    </div>
  );
}
