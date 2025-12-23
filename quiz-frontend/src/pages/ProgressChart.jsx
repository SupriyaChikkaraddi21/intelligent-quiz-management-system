import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/progress/");
        if (Array.isArray(res.data)) {
          setData(res.data);
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "white",
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#22d3ee"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
