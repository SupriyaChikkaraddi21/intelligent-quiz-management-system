// src/pages/QuizSelect.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function QuizSelect() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [userQuizzes, setUserQuizzes] = useState([]);
  const [showUserQuizzes, setShowUserQuizzes] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [recommendedDifficulty, setRecommendedDifficulty] = useState(null);

  const [count, setCount] = useState(5);
  const [quizMode, setQuizMode] = useState("challenge");
  const [questionType, setQuestionType] = useState("mcq");
  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [g, c, s, uq, rec] = await Promise.all([
          api.get("/category-groups/"),
          api.get("/categories/"),
          api.get("/subcategories/"),
          api.get("/quiz/my_quizzes/").catch(() => ({ data: [] })),
          api.get("/user/difficulty/").catch(() => ({ data: null })),
        ]);

        setGroups(Array.isArray(g.data) ? g.data : []);
        setCategories(Array.isArray(c.data) ? c.data : []);
        setSubcategories(Array.isArray(s.data) ? s.data : []);
        setUserQuizzes(Array.isArray(uq.data) ? uq.data : []);
        setRecommendedDifficulty(rec.data?.difficulty || null);
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCategories =
    selectedGroup && Array.isArray(groups)
      ? categories.filter((c) =>
          groups
            .find((g) => String(g.id) === String(selectedGroup))
            ?.categories?.some((gc) => String(gc.id) === String(c.id))
        )
      : [];

  const filteredSubs =
    selectedCategory && Array.isArray(subcategories)
      ? subcategories.filter(
          (s) => String(s.category) === String(selectedCategory)
        )
      : [];

  async function startQuiz() {
    if (!topic.trim() && !selectedCategory) {
      alert("Enter a topic OR select a category");
      return;
    }

    try {
      const payload = {
        difficulty,
        count,
        question_type: questionType,
        language,
      };

      if (topic.trim()) {
        payload.topic = topic.trim();
      } else {
        payload.category = selectedCategory;
        payload.subcategory = selectedSubcategory;
      }

      const gen = await api.post("/quiz/generate/", payload);

      const start = await api.post("/attempt/start/", {
        quiz_id: gen.data.quiz_id,
        mode: quizMode,
        language,
      });

      navigate(`/attempt/${start.data.attempt_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading…
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_40%)] pointer-events-none" />

      <div className="relative w-full space-y-10">

        {/* HEADER */}
        <section className="space-y-3">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Quiz Center
          </h1>
          <p className="text-slate-400 text-sm">
            Configure and generate your AI quiz.
          </p>

          <div className="pt-4 flex gap-4">
            <PrimaryButton
              large
              onClick={() => navigate("/create-quiz")}
            >
              + Create Quiz
            </PrimaryButton>
          </div>
        </section>

        {/* SEARCH */}
        <Card>
          <Label>Search Topic (AI)</Label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
            placeholder="Example: Data Structures, Operating Systems..."
            className="w-full rounded-xl border border-slate-300 px-5 py-4 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200"
          />
        </Card>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            <Card>
              <Label>Language</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-5 py-4 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="en">English</option>
                <option value="kn">Kannada</option>
              </select>
            </Card>

            <Card>
              <Label>Quiz Mode</Label>
              <Segmented
                value={quizMode}
                options={[
                  { key: "challenge", label: "🔥 Challenge" },
                  { key: "practice", label: "🧠 Practice" },
                ]}
                onChange={setQuizMode}
              />
            </Card>

            <Card>
              <Label>Question Type</Label>
              <Segmented
                value={questionType}
                options={[
                  { key: "mcq", label: "MCQ" },
                  { key: "true_false", label: "TRUE / FALSE" },
                  { key: "type_answer", label: "TYPE ANSWER" },
                ]}
                onChange={setQuestionType}
              />
            </Card>

            <Card>
              <Label>Difficulty</Label>
              {recommendedDifficulty && (
                <p className="text-xs text-indigo-600 mb-2 font-medium">
                  Recommended: {recommendedDifficulty}
                </p>
              )}
              <Segmented
                value={difficulty}
                options={[
                  { key: "easy", label: "Easy" },
                  { key: "medium", label: "Medium" },
                  { key: "hard", label: "Hard" },
                ]}
                onChange={setDifficulty}
              />
            </Card>

            <Card>
              <Label>Number of Questions</Label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-5 py-4 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <Card>
              <Label>Category Group</Label>
              <div className="grid grid-cols-2 gap-3">
                {groups.length === 0 && (
                  <p className="text-slate-400 text-sm">No category groups found</p>
                )}
                {groups.map((g) => (
                  <Tile
                    key={g.id}
                    active={selectedGroup === g.id}
                    onClick={() => {
                      setSelectedGroup(g.id);
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                      setTopic("");
                    }}
                  >
                    {g.name}
                  </Tile>
                ))}
              </div>
            </Card>

            {selectedGroup && (
              <Card>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-3">
                  {filteredCategories.map((c) => (
                    <Tile
                      key={c.id}
                      active={selectedCategory === c.id}
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setTopic("");
                      }}
                    >
                      {c.name}
                    </Tile>
                  ))}
                </div>
              </Card>
            )}

            {selectedCategory && (
              <Card>
                <Label>Subcategory</Label>
                <div className="grid grid-cols-2 gap-3">
                  {filteredSubs.map((s) => (
                    <Tile
                      key={s.id}
                      active={selectedSubcategory === s.id}
                      onClick={() => {
                        setSelectedSubcategory(s.id);
                        setTopic("");
                      }}
                    >
                      {s.name}
                    </Tile>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <PrimaryButton full large onClick={startQuiz}>
          Start AI Quiz
        </PrimaryButton>

      </div>
    </main>
  );
}

/* UI COMPONENTS BELOW REMAIN EXACTLY SAME */


/* ---------- PREMIUM UI COMPONENTS ---------- */

function Card({ children }) {
  return (
    <div className="rounded-2xl bg-slate-100/90 backdrop-blur-md border border-slate-200 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <p className="text-xs uppercase text-slate-500 mb-4 tracking-wider font-semibold">
      {children}
    </p>
  );
}

function Tile({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-[1.03]"
            : "bg-slate-200 text-slate-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
        }`}
    >
      {children}
    </button>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="flex rounded-xl bg-slate-200 p-1">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200
              ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PrimaryButton({ children, onClick, full, large }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} ${
        large ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
      } rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, large }) {
  return (
    <button
      onClick={onClick}
      className={`${
        large ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
      } rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 hover:scale-[1.03] transition-all duration-300`}
    >
      {children}
    </button>
  );
}
