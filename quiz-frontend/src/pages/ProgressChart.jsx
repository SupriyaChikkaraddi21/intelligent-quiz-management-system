import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ---------------- helpers ---------------- */

const COLORS = ["#38bdf8", "#22d3ee", "#60a5fa", "#0ea5e9", "#7dd3fc"];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toDateString();
};

/* -------- CUSTOM TOOLTIP -------- */
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

export default function ProgressChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/progress/");
        if (Array.isArray(res.data)) {
          const transformed = res.data.map((d, i) => ({
            ...d,
            xKey: `${d.date}-${i}`,
            displayDate: formatDate(d.date),
          }));
          setData(transformed);
        }
      } catch (err) {
        console.error("Progress load failed:", err);
      }
    }
    load();
  }, []);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No progress data yet.
      </div>
    );
  }

  /* -------- PIE DATA -------- */
  const pieData = [
    { name: "Excellent (80+)", value: data.filter(d => d.score >= 80).length },
    { name: "Good (60–79)", value: data.filter(d => d.score >= 60 && d.score < 80).length },
    { name: "Needs Work (<60)", value: data.filter(d => d.score < 60).length },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

      {/* ================= LINE CHART ================= */}
      <div className="bg-white rounded-2xl border border-sky-200 p-4 h-[320px]">
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          📈 Score Trend
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis dataKey="xKey" tickFormatter={(v) => v.split("-")[0]} />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="linear"
              dataKey="score"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white rounded-2xl border border-sky-200 p-4 h-[320px]">
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          📊 Score Comparison
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis dataKey="displayDate" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= PIE CHART (LEFT) ================= */}
      <div className="bg-white rounded-2xl border border-sky-200 p-4 h-[320px]">
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          🥧 Performance Distribution
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v} attempts`, n]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ================= AREA CHART (RIGHT) ================= */}
      <div className="bg-white rounded-2xl border border-sky-200 p-4 h-[320px]">
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          🌊 Learning Momentum
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis dataKey="xKey" tickFormatter={(v) => v.split("-")[0]} />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="linear"
              dataKey="score"
              stroke="#0284c7"
              fill="url(#skyGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
