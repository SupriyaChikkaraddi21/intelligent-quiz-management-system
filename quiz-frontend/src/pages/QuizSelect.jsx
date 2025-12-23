import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function QuizSelect() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // LOAD DATA (UNCHANGED)
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const groupRes = await api.get("/category-groups/");
        const catRes = await api.get("/categories/");
        const subRes = await api.get("/subcategories/");

        setGroups(groupRes.data || []);
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // FILTER CATEGORIES BY GROUP (UNCHANGED)
  const filteredCategories = selectedGroup
    ? categories.filter((c) =>
        groups
          .find((g) => g.id === selectedGroup)
          ?.categories.some((gc) => gc.id === c.id)
      )
    : [];

  // FILTER SUBCATEGORIES BY CATEGORY (UNCHANGED)
  const filteredSubs = subcategories.filter(
    (s) => String(s.category) === String(selectedCategory)
  );

  // ---------------------------------------------------------
  // GENERATE + START QUIZ (UNCHANGED)
  // ---------------------------------------------------------
  async function generateQuiz() {
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    try {
      const gen = await api.post("/quiz/generate/", {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        difficulty: difficulty.toLowerCase(),
        count,
      });

      const quizId = gen.data.quiz_id;
      if (!quizId) {
        alert("Quiz generation failed");
        return;
      }

      const start = await api.post(`/quiz/${quizId}/start/`);
      const attemptId = start.data?.attempt?.id;

      if (!attemptId) {
        alert("Failed to start quiz");
        return;
      }

      navigate(`/attempt/${attemptId}`);
    } catch (err) {
      console.error("Quiz error:", err);
      alert("Quiz generation failed");
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Loading quiz setup…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-10 py-10">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Create Your Quiz</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          Choose a category, difficulty, and question count to begin.
        </p>
      </div>

      <div className="max-w-4xl space-y-12">

        {/* STEP 1 — CATEGORY GROUP */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Category Group</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGroup(g.id);
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`rounded-2xl p-5 text-left border transition-all
                ${
                  selectedGroup === g.id
                    ? "bg-white/10 border-cyan-400 shadow-lg"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="text-lg font-medium">{g.name}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Select quizzes from this group
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2 — CATEGORY */}
        {selectedGroup && (
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setSelectedSubcategory(null);
                  }}
                  className={`rounded-2xl p-4 text-left border transition
                  ${
                    selectedCategory === c.id
                      ? "bg-white/10 border-emerald-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 — SUBCATEGORY */}
        {selectedCategory && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. Subcategory <span className="text-sm text-slate-400">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredSubs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubcategory(s.id)}
                  className={`rounded-2xl p-4 text-left border transition
                  ${
                    selectedSubcategory === s.id
                      ? "bg-white/10 border-purple-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 4 — DIFFICULTY */}
        <section>
          <h2 className="text-xl font-semibold mb-4">4. Difficulty</h2>
          <div className="flex gap-4">
            {["easy", "medium", "hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-6 py-3 rounded-full uppercase text-sm tracking-wide transition
                ${
                  difficulty === lvl
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </section>

        {/* STEP 5 — QUESTION COUNT */}
        <section>
          <h2 className="text-xl font-semibold mb-4">5. Number of Questions</h2>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
        </section>

        {/* CTA */}
        <section className="pt-6">
          <button
            onClick={generateQuiz}
            className="w-full py-4 rounded-2xl text-lg font-semibold
            bg-gradient-to-r from-cyan-400 to-blue-500
            text-black hover:opacity-90 transition"
          >
            Generate & Start Quiz
          </button>
        </section>

      </div>
    </div>
  );
}
