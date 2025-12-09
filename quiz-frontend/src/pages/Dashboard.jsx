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
      <div className="dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-loading">
        <div>No dashboard data available.</div>
      </div>
    );
  }

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
    <div className="dashboard-page">
      {/* ✅ PAGE HEADER */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview — your quiz activity and performance.</p>
      </div>

      {/* ✅ KPI ROW */}
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-label">Total Quizzes Attempted</div>
          <div className="kpi-value">{data.total_quizzes ?? 0}</div>
          <div className="kpi-sub">Number of quizzes you attempted so far</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Average Score</div>
          <div className="kpi-value black">
            {Math.round(data.average_score ?? 0)}%
          </div>
          <div className="kpi-sub">Your average quiz score</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Recent Attempts</div>
          <div className="kpi-value">
            {Array.isArray(data.recent_scores)
              ? data.recent_scores.length
              : 0}
          </div>
          <div className="kpi-sub">Most recent quiz attempts</div>
        </div>
      </div>

      {/* ✅ RECENT ATTEMPTS TABLE */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent Attempts</h2>
            <p>Latest attempts and current status</p>
          </div>
          <div className="section-meta">
            Showing latest{" "}
            {Math.min((data.recent_scores || []).length, 5)}
          </div>
        </div>

        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Date</th>
                <th className="right">Score</th>
                <th className="right">Status</th>
              </tr>
            </thead>

            <tbody>
              {!data.recent_scores || data.recent_scores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No recent attempts available.
                  </td>
                </tr>
              ) : (
                data.recent_scores.slice(0, 20).map((r, i) => {
                  const dateStr = formatDate(r.started_at);
                  const displayDate = dateStr ?? "Not available";
                  const scoreDisplay =
                    r.score !== null && r.score !== undefined
                      ? `${r.score}%`
                      : "—";
                  const completed = !!r.completed;
                  const statusLabel = dateStr
                    ? completed
                      ? "Completed"
                      : "In progress"
                    : "Pending";

                  return (
                    <tr key={i}>
                      <td>
                        <div className="attempt-title">{`Attempt ${
                          i + 1
                        }`}</div>
                        <div className="attempt-sub">
                          {r.quiz_title ?? "Quiz attempt"}
                        </div>
                      </td>

                      <td>
                        {dateStr ? (
                          <div>{displayDate}</div>
                        ) : (
                          <div className="muted">Not available</div>
                        )}
                      </td>

                      <td className="right">{scoreDisplay}</td>

                      <td className="right">
                        {statusLabel === "Completed" ? (
                          <span className="status completed">Completed</span>
                        ) : statusLabel === "In progress" ? (
                          <span className="status progress">In progress</span>
                        ) : (
                          <span className="status pending">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ✅ PERFORMANCE CHART */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Performance</h2>
            <p>Score trend over time</p>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrap">
            <ProgressChartPage />
          </div>
          <div className="chart-note">
            The chart displays your score history (older → newer). Hover a point
            to see the exact attempt date and score.
          </div>
        </div>
      </section>
    </div>
  );
}
