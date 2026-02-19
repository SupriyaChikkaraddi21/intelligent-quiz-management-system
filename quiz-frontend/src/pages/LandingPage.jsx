import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="text-xl font-extrabold tracking-tight cursor-pointer"
          >
            Quiz<span className="text-sky-400">Gen</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 text-sm rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-lg shadow-sky-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative">

        {/* Background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-sky-500/20 blur-[160px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Intelligent <br />
              <span className="text-sky-400">Quiz Management</span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Build, generate, and analyze quizzes using AI. Track performance,
              adapt difficulty, and improve learning outcomes — all in one
              powerful learning system.
            </p>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => navigate("/register")}
                className="bg-sky-500 hover:bg-sky-600 px-7 py-3 rounded-xl font-semibold text-white transition shadow-xl shadow-sky-500/40"
              >
                Start Free
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-7 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
              >
                View Dashboard
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              AI-powered • Secure • Academic-ready
            </p>
          </div>

          {/* RIGHT - ENHANCED PREVIEW */}
          <div className="hidden md:block">
            <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl">

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-sky-500/5 blur-2xl pointer-events-none" />

              <p className="text-sm text-slate-400 mb-6 relative">
                Dashboard Preview
              </p>

              {/* Elevated Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 relative">
                {[
                  ["Total Quizzes", "12"],
                  ["Avg Score", "78%"],
                  ["Accuracy", "82%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/10 backdrop-blur-md p-4 text-center border border-white/20 shadow-md hover:-translate-y-1 transition"
                  >
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Animated Bars */}
              <div className="relative">
                <p className="text-xs text-slate-400 mb-2">Score Trend</p>
                <div className="flex items-end gap-2 h-24">
                  {[35, 50, 65, 60, 78, 82].map((v, i) => (
                    <div
                      key={i}
                      className="w-4 rounded-lg bg-sky-400 shadow-lg shadow-sky-400/40 transition-all duration-700 ease-out"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth transition */}
        <div className="h-32 bg-gradient-to-b from-transparent to-slate-900" />
      </section>

      {/* ================= WHY ================= */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-16 text-center">
          Why QuizGen?
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Problem */}
          <div className="rounded-2xl bg-white/5 border border-red-400/20 p-8 backdrop-blur-xl">
            <div className="text-3xl mb-4">⚠️</div>
            <h3 className="font-semibold text-lg mb-2 text-red-300">
              The Problem
            </h3>
            <p className="text-slate-300">
              Manual quiz creation is slow, analytics are weak, and learners
              rarely get actionable feedback.
            </p>
          </div>

          {/* Solution */}
          <div className="rounded-2xl bg-sky-500/10 border border-sky-400/30 p-8 backdrop-blur-xl shadow-lg shadow-sky-500/20">
            <div className="text-3xl mb-4">💡</div>
            <h3 className="font-semibold text-lg mb-2 text-sky-300">
              The Solution
            </h3>
            <p className="text-slate-200">
              QuizGen automates question generation and delivers real-time
              performance insights with adaptive difficulty.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="py-28 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Core Capabilities
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              ["🔐", "Secure Login & Profiles"],
              ["🎯", "Category & Difficulty Selection"],
              ["🤖", "AI-Generated Questions"],
              ["⏱", "Timed Quiz Attempts"],
              ["⚡", "Automatic Scoring"],
              ["📊", "Advanced Analytics Dashboard"],
            ].map(([icon, title]) => (
              <div
                key={title}
                className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl hover:-translate-y-2 hover:shadow-xl transition duration-300"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-semibold mb-3">{title}</h3>
                <p className="text-sm text-slate-300">
                  Designed for performance, scalability, and measurable learning outcomes.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-36 text-center overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-sky-700" />
        <div className="absolute inset-0 bg-sky-500/20 blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-extrabold">
            Transform the Way You Learn.
          </h2>

          <p className="mt-6 text-sky-100 text-lg">
            Smarter quizzes. Better insights. Faster improvement.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-12 bg-white text-sky-600 px-12 py-4 rounded-2xl font-semibold text-lg hover:bg-sky-50 transition shadow-2xl shadow-white/40"
          >
            Get Started Free →
          </button>
        </div>
      </section>

    </div>
  );
}
