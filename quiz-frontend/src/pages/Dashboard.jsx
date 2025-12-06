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
        // 🔥 FIXED — ALWAYS USE RELATIVE PATH WITHOUT LEADING SLASH
        const res = await api.get("quiz/dashboard/");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-lg text-[#1E293B]">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-lg text-[#1E293B]">No dashboard data available.</div>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return null;
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt.toLocaleString();
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold text-[#1F3A5F]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Overview — your quiz activity and performance.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Total Quizzes Attempted</div>
          <div className="mt-3 text-3xl font-semibold text-[#1E293B]">
            {data.total_quizzes ?? 0}
          </div>
          <div className="mt-2 text-xs text-[#64748B]">Quizzes attempted</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Average Score</div>
          <div className="mt-3 text-3xl font-semibold text-black">
            {Math.round(data.average_score ?? 0)}%
          </div>
          <div className="mt-2 text-xs text-[#64748B]">Your overall score</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Recent Attempts</div>
          <div className="mt-3 text-3xl font-semibold text-[#1E293B]">
            {data.recent_scores?.length ?? 0}
          </div>
          <div className="mt-2 text-xs text-[#64748B]">Latest activity</div>
        </div>
      </div>

      {/* Recent Attempts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1F3A5F]">
              Recent Attempts
            </h2>
            <p className="text-sm text-[#64748B]">Latest attempts overview</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Attempt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase">Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase">Status</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-50">
                {data.recent_scores?.length ? (
                  data.recent_scores.map((r, i) => {
                    const dateStr = formatDate(r.started_at);

                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1E293B]">Attempt {i + 1}</div>
                          <div className="text-xs text-[#64748B]">{r.quiz_title}</div>
                        </td>

                        <td className="px-6 py-4">{dateStr ?? "Not available"}</td>

                        <td className="px-6 py-4 text-right">{r.score}%</td>

                        <td className="px-6 py-4 text-right">
                          {r.completed ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                              In Progress
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#64748B]">
                      No attempts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section>
        <h2 className="text-lg font-semibold text-[#1F3A5F] mb-3">Performance</h2>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="w-full h-[360px] px-2 py-3">
            <ProgressChartPage />
          </div>
        </div>
      </section>
    </div>
  );
}
