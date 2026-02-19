import React from "react";
import { useNavigate } from "react-router-dom";

export default function CreateQuizMode() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full px-6 py-12
                    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_45%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Create a Quiz
          </h1>
          <p className="text-slate-400">
            Choose how you want to create your quiz.
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* AI Mode */}
          <div
            onClick={() => navigate("/create/ai")}
            className="cursor-pointer rounded-2xl bg-white p-8 shadow-lg
                       hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-2xl font-semibold text-slate-800">
              AI Generated Quiz
            </h2>
            <p className="mt-3 text-slate-500 text-sm">
              Enter a topic and let AI generate questions automatically.
              Fast, smart, and optimized.
            </p>

            <div className="mt-6">
              <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                Start with AI →
              </button>
            </div>
          </div>

          {/* Manual Mode */}
          <div
            onClick={() => navigate("/create/manual")}
            className="cursor-pointer rounded-2xl bg-white p-8 shadow-lg
                       hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="text-5xl mb-4">✍️</div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Manual Quiz Builder
            </h2>
            <p className="mt-3 text-slate-500 text-sm">
              Create your own questions with full control over structure,
              options, and difficulty.
            </p>

            <div className="mt-6">
              <button className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition">
                Build Manually →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
