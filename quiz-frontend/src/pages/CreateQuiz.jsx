// src/pages/CreateQuiz.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import QuestionBuilder from "../components/QuestionBuilder";

/* ================= QUESTION BLUEPRINTS ================= */

const MCQ_QUESTION = {
  question_text: "",
  question_type: "mcq",
  choices: ["", "", "", ""],
  correct_choice: 0,
  hint: "",
  explanation: "",
  difficulty: "easy",
};

const TRUE_FALSE_QUESTION = {
  question_text: "",
  question_type: "true_false",
  choices: ["True", "False"],
  correct_choice: 0,
  hint: "",
  explanation: "",
  difficulty: "easy",
};

const TYPE_ANSWER_QUESTION = {
  question_text: "",
  question_type: "type_answer",
  correct_text: "",
  hint: "",
  explanation: "",
  difficulty: "easy",
};

export default function CreateQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const classroomId = new URLSearchParams(location.search).get("classroom");

  const editQuizId = new URLSearchParams(location.search).get("edit");
  const isEditMode = Boolean(editQuizId);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [questions, setQuestions] = useState([
    JSON.parse(JSON.stringify(MCQ_QUESTION)),
  ]);
  const [loading, setLoading] = useState(isEditMode);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => setCategories(res.data || []))
      .catch(() => alert("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadQuiz() {
      try {
        const res = await api.get(`/quiz-management/${editQuizId}/`);
        setTitle(res.data.title || "");
        setCategory(res.data.category || "");
        setLanguage(res.data.language || "en");
        setQuestions(res.data.questions || []);
      } catch {
        alert("Failed to load quiz");
        navigate("/my-quizzes");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [editQuizId, isEditMode, navigate]);

  /* ================= HELPERS ================= */

  const updateQuestion = (index, key, value) => {
    const copy = [...questions];
    copy[index][key] = value;
    setQuestions(copy);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const copy = [...questions];
    copy[qIndex].choices[cIndex] = value;
    setQuestions(copy);
  };

  const addQuestion = (type) => {
    const q =
      type === "true_false"
        ? TRUE_FALSE_QUESTION
        : type === "type_answer"
        ? TYPE_ANSWER_QUESTION
        : MCQ_QUESTION;

    setQuestions([...questions, JSON.parse(JSON.stringify(q))]);
  };

  const validateStep1 = () => {
    if (!title.trim()) return alert("Quiz title is required");
    return true;
  };

  const validateStep2 = () => {
    if (!questions.length) return alert("Add at least one question");
    return true;
  };

  /* ================= SAVE ================= */

  const saveQuiz = async () => {
    const payloadQuestions = questions.map((q) => ({ ...q, language }));

    try {
      if (isEditMode) {
        await api.put(`/quiz-management/${editQuizId}/`, {
          title,
          category: category || null,
          questions: payloadQuestions,
        });

        alert("✅ Quiz updated successfully");
        navigate("/my-quizzes");
        return;
      }

      const res = await api.post("/quiz-management/create_user_quiz/", {
        title,
        category: category || null,
        questions: payloadQuestions,
      });

      if (classroomId) {
        await api.post("/quiz/assign/", {
          classroom_id: classroomId,
          quiz_id: res.data.quiz_id,
        });

        alert("✅ Quiz created and assigned to classroom!");
        navigate(`/classrooms/${classroomId}`);
        return;
      }

      const start = await api.post(`/attempt/start/`, {
        quiz_id: res.data.quiz_id,
        mode: "practice",
        language,
      });

      alert("🚀 Quiz created! Starting now.");
      navigate(`/attempt/${start.data.attempt_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
        Loading quiz…
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_40%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-10">

        <header>
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            {isEditMode ? "Edit Quiz" : "Create Custom Quiz"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Design and build your own quiz manually.
          </p>
        </header>

        {/* STEPPER */}
        <div className="flex gap-6 items-center">
          {["Quiz Info", "Questions", "Review"].map((label, i) => {
            const current = step === i + 1;
            const completed = step > i + 1;

            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      completed
                        ? "bg-emerald-500 text-white"
                        : current
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm ${
                    current ? "font-semibold text-white" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <Card>
            <Select value={language} onChange={setLanguage}>
              <option value="en">English</option>
              <option value="kn">Kannada</option>
            </Select>

            <Input
              placeholder="Quiz title"
              value={title}
              onChange={setTitle}
            />

            <Select value={category} onChange={setCategory}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <PrimaryButton onClick={() => validateStep1() && setStep(2)}>
              Continue → Add Questions
            </PrimaryButton>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="space-y-6">
              {questions.map((q, i) => (
                <Card key={i}>
                  <p className="text-sm font-semibold text-slate-400">
                    Question {i + 1}
                  </p>

                  <QuestionBuilder
                    index={i}
                    question={q}
                    onChange={updateQuestion}
                    onChoiceChange={updateChoice}
                  />
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <SecondaryButton onClick={() => addQuestion("mcq")}>
                + MCQ
              </SecondaryButton>
              <SecondaryButton onClick={() => addQuestion("true_false")}>
                + True / False
              </SecondaryButton>
              <SecondaryButton onClick={() => addQuestion("type_answer")}>
                + Type Answer
              </SecondaryButton>
            </div>

            <StickyFooter>
              <SecondaryButton onClick={() => setStep(1)}>
                ← Back
              </SecondaryButton>
              <PrimaryButton
                onClick={() => validateStep2() && setStep(3)}
              >
                Review Quiz →
              </PrimaryButton>
            </StickyFooter>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Card>
            <p className="text-slate-200"><b>Title:</b> {title}</p>
            <p className="text-slate-200"><b>Questions:</b> {questions.length}</p>
            <p className="text-slate-200"><b>Language:</b> {language}</p>

            <StickyFooter>
              <SecondaryButton onClick={() => setStep(2)}>
                ← Back
              </SecondaryButton>
              <PrimaryButton onClick={saveQuiz}>
                {isEditMode
                  ? "Update Quiz"
                  : classroomId
                  ? "Create & Assign Quiz"
                  : "Create & Start Quiz"}
              </PrimaryButton>
            </StickyFooter>
          </Card>
        )}
      </div>
    </main>
  );
}

/* ================= UI COMPONENTS ================= */

const Card = ({ children }) => (
  <div className="rounded-2xl bg-slate-800/70 backdrop-blur-md border border-slate-700 p-8 shadow-xl space-y-5">
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-600 px-5 py-4 bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
  />
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-xl border border-slate-600 px-5 py-4 bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
  >
    {children}
  </select>
);

const PrimaryButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600
               text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
  >
    {children}
  </button>
);

const StickyFooter = ({ children }) => (
  <div className="sticky bottom-6 bg-slate-800/80 backdrop-blur p-4 rounded-2xl
                  flex justify-between gap-4 shadow-lg">
    {children}
  </div>
);
