import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function QuizSelect() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const catRes = await api.get("/categories/");
        const subRes = await api.get("/subcategories/");

        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (err) {
        console.error("Category load error:", err);
        alert("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredSubs = subcategories.filter(
    (s) => String(s.category) === String(selectedCategory)
  );

  async function generateQuiz() {
    if (!selectedCategory) {
      return alert("Select a category first!");
    }

    try {
      // Generate quiz
      const gen = await api.post("/quiz/generate/", {
        category: selectedCategory,
        subcategory: selectedSubcategory || null,
        difficulty,
        count,
      });

      const quizId = gen.data.quiz_id;

      // Start attempt
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

        <div className="mb-5">
          <label className="font-semibold">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("");
            }}
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="font-semibold">Select Subcategory (optional)</label>
          <select
            value={selectedSubcategory}
            disabled={!selectedCategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="w-full mt-2 p-3 border rounded-lg disabled:bg-gray-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Any Subcategory --</option>
            {filteredSubs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="font-semibold">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

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
