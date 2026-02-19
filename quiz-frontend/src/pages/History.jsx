// src/pages/History.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= LOAD DATA (UNCHANGED) ================= */

  useEffect(() => {
    api
      .get("/history/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= NAVIGATION LOGIC (UNCHANGED) ================= */

  const handleClick = (item) => {
    if (item.status === "In Progress") {
      navigate(`/attempt/${item.attempt_id}`);
    } else {
      navigate(`/results/${item.attempt_id}`);
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-red-400">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400">
        No quiz history yet.
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen w-full px-6 py-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient glow (tight + consistent with QuizSelect) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_38%)] pointer-events-none" />

      <div className="relative w-full space-y-5">
        {/* HEADER (tightened to match content density) */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[34px] font-semibold text-white tracking-tight">
            Quiz History
          </h1>
          <p className="text-sm text-slate-400">
            Review your past quiz attempts and results
          </p>
        </div>

        {/* HISTORY LIST */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.attempt_id}
              onClick={() => handleClick(item)}
              className="
                group cursor-pointer
                bg-white rounded-2xl
                px-5 py-3.5
                shadow-sm
                transition-all duration-200
                hover:shadow-lg hover:-translate-y-[1px]
              "
            >
              <div className="flex items-center justify-between gap-6">
                {/* LEFT CONTENT */}
                <div className="space-y-0.5">
                  <h2 className="text-[17px] font-semibold text-slate-900">
                    {item.quiz_title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-700">
                      Score: {item.score}%
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`font-medium ${
                        item.status === "In Progress"
                          ? "text-amber-500/80"
                          : "text-emerald-500/80"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Attempted on{" "}
                    {item.finished_at
                      ? new Date(item.finished_at).toLocaleString()
                      : "—"}
                  </div>
                </div>

                {/* RIGHT ACTION (normalized & subtle) */}
                <div className="text-sm font-medium text-indigo-500/80 opacity-70 group-hover:opacity-100 transition">
                  View →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
