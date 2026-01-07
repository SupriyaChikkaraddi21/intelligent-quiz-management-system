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
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading leaderboard…
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  // Card background colors for top 3
  const cardColors = [
    "bg-yellow-50 border-yellow-300", // Gold
    "bg-slate-100 border-slate-300",  // Silver
    "bg-orange-50 border-orange-300", // Bronze
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100
                    text-slate-800 px-10 py-10">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Leaderboard
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Top performers ranked by average quiz score.
        </p>
      </div>

      {/* PODIUM (TOP 3) */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {rows.slice(0, 3).map((row, idx) => {
            const rank = idx + 1;

            return (
              <div
                key={idx}
                className={`rounded-3xl border p-6 shadow-md
                            ${cardColors[idx]}`}
              >
                {/* MEDAL */}
                <div className="text-center text-6xl mb-3">
                  {medals[idx]}
                </div>

                <div className="text-center text-sm text-slate-500 mb-1">
                  Rank #{rank}
                </div>

                <div className="text-center text-xl font-semibold mb-2">
                  {row.username ||
                    row.user__username ||
                    row.user ||
                    "Unknown User"}
                </div>

                <div className="text-center text-4xl font-bold text-sky-600">
                  {Math.round(row.avg_score || 0)}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL TABLE */}
      <div className="rounded-3xl bg-white border border-sky-200
                      shadow-md overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs uppercase text-slate-600">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase text-slate-600">
                User
              </th>
              <th className="px-6 py-4 text-right text-xs uppercase text-slate-600">
                Average Score
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-sky-200">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-sky-50 transition"
              >
                <td className="px-6 py-4 font-semibold">
                  #{index + 1}
                  {index < 3 && (
                    <span className="ml-2 text-xl">
                      {medals[index]}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {row.username ||
                    row.user__username ||
                    row.user ||
                    "Unknown User"}
                </td>

                <td className="px-6 py-4 text-right font-semibold text-sky-600">
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
