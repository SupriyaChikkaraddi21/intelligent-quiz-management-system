import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/leaderboard/");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-10 py-10">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          Top performers ranked by average quiz score.
        </p>
      </div>

      {/* PODIUM (TOP 3) */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {rows.slice(0, 3).map((row, idx) => {
            const rank = idx + 1;
            const colors = [
              "from-yellow-400 to-amber-500", // 🥇
              "from-slate-300 to-slate-400",  // 🥈
              "from-orange-400 to-orange-500" // 🥉
            ];

            return (
              <div
                key={idx}
                className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors[idx]} opacity-20`}
                />
                <div className="relative">
                  <div className="text-sm text-slate-400 mb-2">
                    Rank #{rank}
                  </div>
                  <div className="text-xl font-semibold mb-1">
                    {row.username ||
                      row.user__username ||
                      row.user ||
                      "Unknown User"}
                  </div>
                  <div className="text-4xl font-bold">
                    {Math.round(row.avg_score || 0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL TABLE */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs uppercase text-slate-300">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase text-slate-300">
                User
              </th>
              <th className="px-6 py-4 text-right text-xs uppercase text-slate-300">
                Average Score
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-white/5 transition"
              >
                <td className="px-6 py-4 font-semibold">
                  #{index + 1}
                </td>

                <td className="px-6 py-4">
                  {row.username ||
                    row.user__username ||
                    row.user ||
                    "Unknown User"}
                </td>

                <td className="px-6 py-4 text-right font-semibold">
                  {Math.round(row.avg_score || 0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
