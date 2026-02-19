// src/pages/ProgressChart.jsx
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

/* ---------------- helpers (UNCHANGED) ---------------- */

const COLORS = ["#38bdf8", "#22d3ee", "#60a5fa"];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toDateString();
};

/* ---------------- CUSTOM TOOLTIP (UNCHANGED LOGIC) ---------------- */

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { displayDate, score } = payload[0].payload;

    return (
      <div className="bg-white border border-sky-200 rounded-lg px-3 py-2 text-sm shadow-md">
        <p className="text-sky-700 font-semibold">{displayDate}</p>
        <p className="text-slate-700">
          Score: <span className="font-bold">{score}%</span>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400">
        No progress data yet.
      </div>
    );
  }

  /* ---------------- PIE DATA (UNCHANGED) ---------------- */

  const pieData = [
    { name: "Excellent (80+)", value: data.filter(d => d.score >= 80).length },
    { name: "Good (60–79)", value: data.filter(d => d.score >= 60 && d.score < 80).length },
    { name: "Needs Work (<60)", value: data.filter(d => d.score < 60).length },
  ];

  return (
    /* ✅ FIX: no max-width, tighter horizontal padding (matches Quiz Select) */
    <div className="relative min-h-screen w-full px-4 py-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full space-y-6">

        {/* HEADER */}
        <section className="space-y-1">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Progress
          </h1>
          <p className="text-sm text-slate-400">
            Visualize your learning growth and performance trends.
          </p>
        </section>

        {/* CHART GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SCORE TREND — PRIMARY */}
          <ChartCard
            title="📈 Score Trend"
            insight="Consistency over time matters more than short spikes."
            emphasis
          >
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
          </ChartCard>

          {/* SCORE COMPARISON */}
          <ChartCard
            title="📊 Score Comparison"
            insight="Spot strong and weak attempts instantly."
          >
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
          </ChartCard>

          {/* PERFORMANCE DISTRIBUTION */}
          <ChartCard
            title="🥧 Performance Distribution"
            insight="See where most of your attempts fall."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v, n) => [`${v} attempts`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* LEARNING MOMENTUM */}
          <ChartCard
            title="🌊 Learning Momentum"
            insight="Sustained effort beats short bursts."
          >
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
          </ChartCard>

        </div>

        {/* FOOTER TIP */}
        <div className="text-xs text-slate-500 max-w-3xl">
          💡 <span className="text-slate-400 font-medium">Tip:</span>{" "}
          Stable progress compounds faster than occasional highs.
        </div>

      </div>
    </div>
  );
}

/* ---------------- UI WRAPPER ---------------- */

function ChartCard({ title, insight, children, emphasis = false }) {
  return (
    <div
      className={`
        rounded-2xl bg-white p-5 h-[320px]
        shadow-sm transition
        ${emphasis ? "ring-2 ring-sky-400 shadow-md" : "hover:shadow-md"}
      `}
    >
      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        {insight}
      </p>
      {children}
    </div>
  );
}
