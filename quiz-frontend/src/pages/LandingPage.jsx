import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-slate-800">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-sky-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div
            onClick={() => navigate("/")}
            className="text-xl font-extrabold cursor-pointer text-slate-900"
          >
            Quiz<span className="text-sky-500">Gen</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-lg border border-sky-400 text-sky-500
                         hover:bg-sky-50 transition"
            >
              Register
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-lg bg-sky-500 text-white font-semibold
                         hover:bg-sky-600 transition"
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">

        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
            QuizGen <br />
            <span className="text-sky-500">Intelligent Quiz Management</span>
          </h1>

          <p className="mt-6 text-slate-600 max-w-xl">
            Build, generate, and analyze quizzes using AI. Track performance,
            adapt difficulty, and improve learning outcomes — all in one platform.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/register")}
              className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg
                         font-semibold text-white transition"
            >
              Start Free
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="border border-sky-300 px-6 py-3 rounded-lg
                         hover:bg-sky-50 transition"
            >
              View Dashboard
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            AI-powered • Secure • Academic-ready
          </p>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="hidden md:block">
          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-6">

            <p className="text-sm text-slate-500 mb-4">Dashboard Preview</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-white p-4 text-center border border-sky-100">
                <p className="text-xs text-slate-500">Total Quizzes</p>
                <p className="text-xl font-bold">12</p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center border border-sky-100">
                <p className="text-xs text-slate-500">Avg Score</p>
                <p className="text-xl font-bold text-sky-500">78%</p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center border border-sky-100">
                <p className="text-xs text-slate-500">Accuracy</p>
                <p className="text-xl font-bold text-emerald-500">82%</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Score Trend</p>
              <div className="flex items-end gap-2 h-20">
                {[30, 45, 60, 50, 75, 82].map((v, i) => (
                  <div
                    key={i}
                    className="w-4 rounded bg-sky-400"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-600">
              Latest: <span className="font-semibold">DBMS Quiz</span> — 82%
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10 text-slate-900">
          Why QuizGen?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl bg-sky-50 border border-sky-200 p-6
                          hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]
                          transition">
            <div className="text-2xl mb-3">⚠️</div>
            <h3 className="font-semibold mb-2">The Problem</h3>
            <p className="text-slate-600 text-sm">
              Manual quiz creation is slow, analytics are weak, and students
              rarely get actionable feedback.
            </p>
          </div>

          <div className="rounded-xl bg-sky-50 border border-sky-200 p-6
                          hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]
                          transition">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="font-semibold mb-2">The Solution</h3>
            <p className="text-slate-600 text-sm">
              QuizGen automates question generation and provides real-time
              performance insights with adaptive difficulty.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CORE CAPABILITIES ================= */}
      <section className="bg-sky-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Core Capabilities
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ["🔐", "Secure Login & Profiles"],
              ["📚", "Category & Difficulty Selection"],
              ["🤖", "AI-Generated Questions"],
              ["⏱️", "Timed Quiz Attempts"],
              ["✅", "Automatic Scoring"],
              ["📊", "Performance Dashboard"],
            ].map(([icon, title], i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-sky-200 p-6
                           hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]
                           transition"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-slate-600">
                  Designed to improve learning efficiency and evaluation quality.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12 text-slate-900">
          How QuizGen Works
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-sm">
          {[
            "Register",
            "Choose Category",
            "Select Difficulty",
            "AI Generates Quiz",
            "Attempt Quiz",
            "View Results",
          ].map((step, i) => (
            <div key={i}>
              <div className="w-10 h-10 mx-auto rounded-full bg-sky-500 text-white
                              flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <p className="mt-3 text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-sky-100 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Get Started with QuizGen
        </h2>
        <p className="text-slate-600 mt-2">
          No payment • Academic access • Instant login
        </p>

        <button
          onClick={() => navigate("/register")}
          className="mt-8 bg-sky-500 hover:bg-sky-600 px-8 py-3 rounded-xl
                     font-semibold text-white transition"
        >
          Get Started
        </button>
      </section>

    </div>
  );
}
