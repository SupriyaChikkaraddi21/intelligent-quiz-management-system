import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0B1220] text-white">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            QuizGen <br />
            <span className="text-cyan-400">
              Intelligent Quiz Management
            </span>
          </h1>

          <p className="mt-6 text-slate-300 max-w-xl">
            Build, generate, and analyze quizzes using AI. Track performance,
            adapt difficulty, and improve learning outcomes — all in one
            platform.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/register")}
              className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Start Free
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              View Dashboard
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            AI-powered • Secure • Academic-ready
          </p>
        </div>

        {/* RIGHT — STATIC DASHBOARD PREVIEW */}
        <div className="hidden md:block">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl">

            <p className="text-sm text-slate-400 mb-4">
              Dashboard Preview
            </p>

            {/* KPI CARDS */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-white/10 p-4 text-center">
                <p className="text-xs text-slate-400">Total Quizzes</p>
                <p className="text-xl font-bold">12</p>
              </div>

              <div className="rounded-lg bg-white/10 p-4 text-center">
                <p className="text-xs text-slate-400">Avg Score</p>
                <p className="text-xl font-bold text-cyan-400">78%</p>
              </div>

              <div className="rounded-lg bg-white/10 p-4 text-center">
                <p className="text-xs text-slate-400">Accuracy</p>
                <p className="text-xl font-bold text-emerald-400">82%</p>
              </div>
            </div>

            {/* FAKE GRAPH */}
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Score Trend</p>
              <div className="flex items-end gap-2 h-20">
                {[30, 45, 60, 50, 75, 82].map((v, i) => (
                  <div
                    key={i}
                    className="w-4 rounded bg-gradient-to-t from-cyan-500 to-blue-500"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>

            {/* RECENT */}
            <div className="text-xs text-slate-300">
              Latest: <span className="font-semibold">DBMS Quiz</span> — 82%
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10">Why QuizGen?</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">The Problem</h3>
            <p className="text-slate-300 text-sm">
              Manual quiz creation is slow, analytics are weak, and students
              rarely get actionable feedback.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">The Solution</h3>
            <p className="text-slate-300 text-sm">
              QuizGen automates question generation and provides real-time
              performance insights with adaptive difficulty.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="bg-[#0F172A] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Core Capabilities
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Secure Login & Profiles",
              "Category & Difficulty Selection",
              "AI-Generated Questions",
              "Timed Quiz Attempts",
              "Automatic Scoring",
              "Performance Dashboard",
            ].map((title, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/5 border border-white/10 p-6"
              >
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-slate-300">
                  Designed to improve learning efficiency and evaluation quality.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">How QuizGen Works</h2>

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
              <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500 flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <p className="mt-3 text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#1F3A5F] py-20 text-center">
        <h2 className="text-3xl font-bold">Get Started with QuizGen</h2>
        <p className="text-slate-300 mt-2">
          No payment • Academic access • Instant login
        </p>

        <button
          onClick={() => navigate("/register")}
          className="mt-8 bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-xl font-semibold transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
