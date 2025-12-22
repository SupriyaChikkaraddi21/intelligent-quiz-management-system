import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function QuizSelect() {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // LOAD GROUPS + CATEGORIES + SUBCATEGORIES
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const groupRes = await api.get("/quiz/category-groups/");
        const catRes = await api.get("/quiz/categories/");
        const subRes = await api.get("/quiz/subcategories/");

        setGroups(groupRes.data || []);
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load quiz settings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // FILTER CATEGORIES FOR SELECTED GROUP
  const filteredCategories = selectedGroup
    ? categories.filter((c) =>
        groups
          .find((g) => g.id === selectedGroup)
          ?.categories.some((gc) => gc.name === c.name)
      )
    : [];

  // FILTER SUBCATEGORIES
  const filteredSubs = subcategories.filter(
    (s) => String(s.category) === String(selectedCategory)
  );

  // ---------------------------------------------------------
  // GENERATE QUIZ
  // ---------------------------------------------------------
  async function generateQuiz() {
    if (!selectedCategory) return alert("Select a category first!");

    try {
      const gen = await api.post("/quiz/generate/", {
        category: selectedCategory,
        subcategory: selectedSubcategory || null,
        difficulty,
        count,
      });

      const quizId = gen.data.quiz_id;

      const start = await api.post(`/quiz/${quizId}/start/`);

      const attemptId =
        start.data.attempt_id ||
        start.data.attempt?.id ||
        start.data.attempt?.attempt_id;

      navigate(`/attempt/${attemptId}`);
    } catch (err) {
      console.error("Quiz Generation Error:", err);
      alert("Quiz generation failed!");
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading quiz settings...
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create a Quiz</h1>

        {/* ================================================
            STEP 1 — GROUP SELECTION
        ================================================= */}
        <h2 className="font-semibold mb-3 text-lg">Select Category Group</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {groups.map((grp) => (
            <div
              key={grp.id}
              onClick={() => {
                setSelectedGroup(grp.id);
                setSelectedCategory(null);
                setSelectedSubcategory("");
              }}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedGroup === grp.id
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              <p className="text-md font-medium">{grp.name}</p>
            </div>
          ))}
        </div>

        {/* ================================================
            STEP 2 — CATEGORY SELECTION
        ================================================= */}
        <h2 className="font-semibold mb-3 text-lg">Select Category</h2>

        {!selectedGroup && (
          <p className="text-sm text-gray-500 mb-3">
            Select a category group first.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubcategory("");
              }}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedCategory == cat.id
                  ? "border-green-600 bg-green-50 shadow-md"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              <p className="text-md font-medium">{cat.name}</p>
            </div>
          ))}
        </div>

        {/* ================================================
            STEP 3 — SUBCATEGORY SELECTION (CARD UI)
        ================================================= */}
        <h2 className="font-semibold mb-3 text-lg">Select Subcategory (optional)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {filteredSubs.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                selectedSubcategory == sub.id
                  ? "border-purple-600 bg-purple-50 shadow-md"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              <p className="text-sm font-medium">{sub.name}</p>
            </div>
          ))}
        </div>

        {/* ================================================
            STEP 4 — DIFFICULTY CARDS
        ================================================= */}
        <h2 className="font-semibold mb-3 text-lg">Difficulty</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {["Easy", "Medium", "Hard"].map((lvl) => (
            <div
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`p-3 text-center rounded-xl border cursor-pointer transition 
                ${
                  difficulty === lvl
                    ? "border-red-600 bg-red-50 shadow-md"
                    : "border-gray-300 bg-white hover:bg-gray-100"
                }`}
            >
              <p className="font-medium">{lvl}</p>
            </div>
          ))}
        </div>

        {/* ================================================
            STEP 5 — QUESTION COUNT
        ================================================= */}
        <div className="mb-5">
          <label className="font-semibold">How Many Questions?</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={generateQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
        >
          Generate & Start Quiz
        </button>
      </div>
    </div>
  );
}
