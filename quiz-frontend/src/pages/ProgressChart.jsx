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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/quizzes/progress/");

        // 🔥 FIX: Ensure data is ALWAYS an array
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          console.warn("Progress API returned non-array:", res.data);
          setData([]); // fallback
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
        setData([]); // fallback to safe value
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="text-center p-4 text-gray-500 text-lg">
        Loading progress chart...
      </div>
    );

  // 🔥 FIX: If array is empty, show message NOT crash UI
  if (!data.length)
    return (
      <div className="p-4 text-center text-gray-600">
        No progress data available yet.
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Score Progress</h1>

      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#4a90e2" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
