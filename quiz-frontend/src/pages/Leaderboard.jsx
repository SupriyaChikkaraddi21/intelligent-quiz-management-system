import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/quizzes/leaderboard/");
        setRows(res.data || []);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        alert("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading leaderboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-8 text-center">Leaderboard</h1>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Average Score</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-semibold">{index + 1}</td>

                  <td className="py-3 px-4">
                    {row.user__username ||
                      row.username ||
                      row.user ||
                      "Unknown User"}
                  </td>

                  <td className="py-3 px-4 font-medium">
                    {Math.round(row.avg_score || row.avg || 0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
