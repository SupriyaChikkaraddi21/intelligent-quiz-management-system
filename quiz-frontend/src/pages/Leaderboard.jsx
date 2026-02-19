// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("all"); // all | weekly | monthly

  /* ================= LOAD DATA (UNCHANGED) ================= */

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const endpoint =
          mode === "weekly"
            ? "/leaderboard/weekly/"
            : mode === "monthly"
            ? "/leaderboard/monthly/"
            : "/leaderboard/";

        const res = await api.get(endpoint);
        setRows(res.data || []);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        alert("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading leaderboard…
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="relative min-h-screen w-full px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_45%)] pointer-events-none" />

      <div className="relative w-full space-y-10">

        {/* HEADER */}
        <section className="space-y-2">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Leaderboard
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Top performers ranked by total challenge points.
          </p>

          <div className="pt-4">
            <Segmented
              value={mode}
              options={[
                { key: "all", label: "All Time" },
                { key: "weekly", label: "This Week" },
                { key: "monthly", label: "This Month" },
              ]}
              onChange={setMode}
            />
          </div>
        </section>

        {/* PODIUM */}
        {rows.length > 0 && (
          <section
            className={`grid gap-6 ${
              rows.length === 1
                ? "grid-cols-1 max-w-md"
                : rows.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
                : "grid-cols-1 md:grid-cols-3"
            } mx-auto`}
          >
            {rows.slice(0, 3).map((row, idx) => {
              const points = row.total_points || 0;

              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl bg-white p-6 text-center shadow-lg transition-all ${
                    idx === 0
                      ? "ring-2 ring-indigo-500 shadow-xl scale-[1.04]"
                      : "hover:shadow-xl hover:-translate-y-[2px]"
                  }`}
                >
                  <div className="text-5xl mb-2">{medals[idx]}</div>

                  <p className="text-4xl font-bold text-indigo-600">
                    {points > 0 ? points : "—"}
                  </p>

                  <div className="mx-auto my-3 h-[2px] w-10 rounded bg-indigo-200" />

                  <p className="text-xs uppercase text-slate-500">
                    Total Points
                  </p>

                  <p className="mt-4 text-sm font-medium text-slate-700 truncate">
                    {row.display_name || "Unknown User"}
                  </p>

                  <p className="text-xs uppercase text-slate-400 mt-1">
                    Rank #{idx + 1}
                  </p>
                </div>
              );
            })}
          </section>
        )}

        {/* FULL TABLE */}
        <section>
          <div className="rounded-2xl bg-white shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-right">Total Points</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((row, index) => {
                  const points = row.total_points || 0;

                  return (
                    <tr
                      key={index}
                      className="group cursor-pointer transition-all hover:bg-slate-50 hover:translate-x-[2px]"
                    >
                      <td className="px-6 py-4 font-semibold relative">
                        <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                        #{index + 1}
                        {index < 3 && (
                          <span className="ml-2 text-lg">
                            {medals[index]}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {row.display_name || "Unknown User"}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                        {points > 0 ? points : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

/* ================= UI PRIMITIVES ================= */

function Segmented({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-700/50 p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            value === o.key
              ? "bg-white text-slate-900 shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
