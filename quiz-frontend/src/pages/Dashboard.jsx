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
        // (unchanged) backend endpoint
        const res = await api.get("/quiz/dashboard/");
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

  // helper to format date safely
  const formatDate = (d) => {
    if (!d) return null;
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      return dt.toLocaleString();
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
        {/* Card style kept uniform */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Total Quizzes Attempted</div>
          <div className="mt-3 text-3xl font-semibold text-[#1E293B]">
            {data.total_quizzes ?? 0}
          </div>
          <div className="mt-2 text-xs text-[#64748B]">Number of quizzes you attempted so far</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Average Score</div>

          {/* requirement: make average score black */}
          <div className="mt-3 text-3xl font-semibold text-[#000000]">
            {Math.round(data.average_score ?? 0)}%
          </div>

          <div className="mt-2 text-xs text-[#64748B]">Your average quiz score</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <div className="text-xs text-[#64748B]">Recent Attempts</div>
          <div className="mt-3 text-3xl font-semibold text-[#1E293B]">
            {Array.isArray(data.recent_scores) ? data.recent_scores.length : 0}
          </div>
          <div className="mt-2 text-xs text-[#64748B]">Most recent quiz attempts</div>
        </div>
      </div>

      {/* Recent Attempts (table) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1F3A5F]">Recent Attempts</h2>
            <p className="text-sm text-[#64748B]">Latest attempts and current status</p>
          </div>
          <div className="text-sm text-[#64748B]">Showing latest {Math.min((data.recent_scores || []).length, 5)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-50">
                {(!data.recent_scores || data.recent_scores.length === 0) ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-[#64748B]">
                      No recent attempts available.
                    </td>
                  </tr>
                ) : (
                  data.recent_scores.slice(0, 20).map((r, i) => {
                    const dateStr = formatDate(r.started_at);
                    const displayDate = dateStr ?? "Not available";
                    const scoreDisplay = (r.score !== null && r.score !== undefined) ? `${r.score}%` : "—";
                    const completed = !!r.completed;
                    const statusLabel = dateStr ? (completed ? "Completed" : "In progress") : "Pending";

                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#1E293B]">{`Attempt ${i + 1}`}</div>
                          <div className="text-xs text-[#64748B]">{r.quiz_title ?? "Quiz attempt"}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {dateStr ? (
                            <div className="text-sm text-[#1E293B]">{displayDate}</div>
                          ) : (
                            <div className="text-sm text-[#64748B]">Not available</div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-[#1E293B]">{scoreDisplay}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {statusLabel === "Completed" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46]">
                              Completed
                            </span>
                          ) : statusLabel === "In progress" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
                              In progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#1F3A5F]">Performance</h2>
          <p className="text-sm text-[#64748B]">Score trend over time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="w-full h-[360px] px-2 py-3"> 
            {/* px/padding ensures chart has breathing room and titles won't overlap edges */}
            <ProgressChartPage />
          </div>
          <div className="mt-3 text-sm text-[#64748B]">
            The chart displays your score history (older → newer). Hover a point to see the exact attempt date and score.
          </div>
        </div>
      </section>
    </div>
  );
}
