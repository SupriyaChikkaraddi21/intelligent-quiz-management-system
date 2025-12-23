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
  // LOAD DATA
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

  // FILTER CATEGORIES BY GROUP
  const filteredCategories = selectedGroup
    ? categories.filter((c) =>
        groups
          .find((g) => g.id === selectedGroup)
          ?.categories.some((gc) => gc.id === c.id)
      )
    : [];

  // FILTER SUBCATEGORIES BY CATEGORY
  const filteredSubs = subcategories.filter(
    (s) => String(s.category) === String(selectedCategory)
  );

  // ---------------------------------------------------------
  // GENERATE + START QUIZ
  // ---------------------------------------------------------
  async function generateQuiz() {
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    try {
      // 1️⃣ Generate quiz
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

      // 2️⃣ Start quiz
      const start = await api.post(`/quiz/${quizId}/start/`);
      const attemptId = start.data?.attempt?.id;

      if (!attemptId) {
        console.error("Invalid start response:", start.data);
        alert("Failed to start quiz");
        return;
      }

      // 3️⃣ Navigate correctly
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
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading quiz settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create a Quiz</h1>

        {/* GROUPS */}
        <h2 className="font-semibold mb-3">Category Group</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                setSelectedGroup(g.id);
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedGroup === g.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              {g.name}
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <h2 className="font-semibold mb-3">Category</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                setSelectedSubcategory(null);
              }}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedCategory === c.id
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300"
              }`}
            >
              {c.name}
            </div>
          ))}
        </div>

        {/* SUBCATEGORIES */}
        <h2 className="font-semibold mb-3">Subcategory (optional)</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {filteredSubs.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSubcategory(s.id)}
              className={`p-3 rounded-lg border cursor-pointer ${
                selectedSubcategory === s.id
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-300"
              }`}
            >
              {s.name}
            </div>
          ))}
        </div>

        {/* DIFFICULTY */}
        <h2 className="font-semibold mb-3">Difficulty</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {["easy", "medium", "hard"].map((lvl) => (
            <div
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`p-3 text-center rounded-lg border cursor-pointer ${
                difficulty === lvl
                  ? "border-red-600 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              {lvl.toUpperCase()}
            </div>
          ))}
        </div>

        {/* COUNT */}
        <div className="mb-6">
          <label className="font-semibold">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="w-full mt-2 p-3 border rounded-lg"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={generateQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
        >
          Generate & Start Quiz
        </button>
      </div>
    </div>
  );
}
