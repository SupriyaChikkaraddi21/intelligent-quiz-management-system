import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

export default function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackLang =
    new URLSearchParams(location.search).get("lang") || "en";

  const [lang, setLang] = useState(fallbackLang);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answerMap, setAnswerMap] = useState({});

  const [timeLeft, setTimeLeft] = useState(null);
  const [quizMode, setQuizMode] = useState("challenge");
  const [quizLocked, setQuizLocked] = useState(false);

  const [visibleHints, setVisibleHints] = useState({});

  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const initializedTimer = useRef(false);

  /* ================= UTIL ================= */

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timerStyle = () => {
    if (timeLeft <= 30) return "bg-red-600";
    if (timeLeft <= 90) return "bg-amber-500";
    return "bg-sky-600";
  };

  const toggleHint = async (qid) => {
    if (visibleHints[qid]) {
      setVisibleHints((p) => ({ ...p, [qid]: false }));
      return;
    }
    try {
      await api.post(`/attempt/${attemptId}/use_hint/`);
      setVisibleHints((p) => ({ ...p, [qid]: true }));
    } catch (err) {
      alert(err.response?.data?.error || "Not enough points");
    }
  };

  /* ================= AUDIO ================= */

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
  };

  const beep = () => {
    if (quizMode === "practice") return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  /* ================= LOAD ================= */

  useEffect(() => {
  async function load() {
    try {
      const res = await api.get(`/attempt/${attemptId}/details/`);
      const data = res.data;

      console.log("Attempt details:", data);

      const questionList = data.questions || [];

      if (!questionList.length) {
        alert("No questions found for this attempt");
        setLoading(false);
        return;
      }

      setLang(data.language || fallbackLang);
      setQuestions(questionList);
      setQuizMode(data.quiz_mode || "challenge");

      const map = {};
      questionList.forEach((q) => {
        map[q.question_id] =
          q.question_type === "type_answer"
            ? q.text_answer || ""
            : q.selected ?? null;
      });

      setAnswerMap(map);

      const first = questionList[0];

      if (first.question_type === "type_answer") {
        setTextAnswer(map[first.question_id] || "");
      } else {
        setSelected(map[first.question_id] ?? null);
      }

      if (data.quiz_mode !== "practice" && !initializedTimer.current) {
        if (data.started_at && data.time_limit) {
          const start = new Date(data.started_at).getTime();
          const elapsed = Math.floor((Date.now() - start) / 1000);
          setTimeLeft(Math.max(data.time_limit - elapsed, 0));
          initializedTimer.current = true;
        }
      }

      setLoading(false);

    } catch (err) {
      console.error("Attempt load error:", err);
      alert("Failed to load quiz");
      setLoading(false);
    }
  }

  load();
}, [attemptId, fallbackLang]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (quizMode === "practice" || timeLeft === null || quizLocked) return;

    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      setQuizLocked(true);
      api.post(`/attempt/${attemptId}/finish/`);
      navigate(`/results/${attemptId}?timeout=1`);
      return;
    }

    if (timeLeft <= 5) {
      initAudio();
      beep();
    }

    timerRef.current = setInterval(
      () => setTimeLeft((p) => p - 1),
      1000
    );

    return () => clearInterval(timerRef.current);
  }, [timeLeft, quizMode, quizLocked]);

  /* ================= ANSWERS ================= */

  const handleSelect = (index) => {
    if (quizLocked) return;
    initAudio();
    const q = questions[currentIndex];
    setSelected(index);
    api.post(`/attempt/${attemptId}/answer/`, {
      question_id: q.question_id,
      selected: index,
    });
  };

  const handleTextSubmit = () => {
    if (quizLocked) return;
    const q = questions[currentIndex];
    api.post(`/attempt/${attemptId}/answer/`, {
      question_id: q.question_id,
      text_answer: textAnswer,
    });
  };

  /* ================= NAV ================= */

  const goNext = async () => {
    if (currentIndex === questions.length - 1) {
      clearInterval(timerRef.current);
      setQuizLocked(true);
      await api.post(`/attempt/${attemptId}/finish/`);
      navigate(`/results/${attemptId}?mode=${quizMode}`);
      return;
    }

    const next = currentIndex + 1;
    const nextQ = questions[next];
    setCurrentIndex(next);
    setSelected(
      nextQ.question_type === "type_answer"
        ? null
        : answerMap[nextQ.question_id] ?? null
    );
    setTextAnswer(answerMap[nextQ.question_id] || "");
  };

  const goPrev = () => {
    if (currentIndex === 0) return;
    const prev = currentIndex - 1;
    const prevQ = questions[prev];
    setCurrentIndex(prev);
    setSelected(
      prevQ.question_type === "type_answer"
        ? null
        : answerMap[prevQ.question_id] ?? null
    );
    setTextAnswer(answerMap[prevQ.question_id] || "");
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        Loading quiz…
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center px-6 py-10">
      <div
        key={currentIndex}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8
                   transition-all duration-300 ease-out
                   animate-[fadeSlide_0.25s_ease-out]"
      >
        {/* TOP */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>

            {quizMode !== "practice" && (
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white shadow ${timerStyle()}`}
              >
                ⏱ Time remaining · {formatTime(timeLeft)}
              </span>
            )}
          </div>

          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION */}
        <h2 className="text-xl font-semibold text-slate-900 mb-5">
          {q.question_text}
        </h2>

        {/* HINT */}
        {quizMode === "practice" && q.hint && (
          <div className="mb-6">
            <button
              onClick={() => toggleHint(q.question_id)}
              className="px-4 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
            >
              💡 {visibleHints[q.question_id] ? "Hide Hint" : "Show Hint"}
            </button>

            {visibleHints[q.question_id] && (
              <div className="mt-3 p-4 rounded-xl bg-yellow-50 border border-yellow-300 text-sm">
                {q.hint}
              </div>
            )}
          </div>
        )}

        {/* ANSWERS */}
        {q.question_type !== "type_answer" ? (
          <div className="space-y-3">
            {q.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl border transition-all
                  ${
                    selected === index
                      ? "bg-sky-500/90 text-white border-sky-500 shadow-lg scale-[1.01]"
                      : "bg-white border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
                  }
                `}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-400"
              placeholder="Type your answer…"
            />
            <button
              onClick={handleTextSubmit}
              className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
            >
              Save Answer
            </button>
          </div>
        )}

        {/* NAV */}
        <div className="flex justify-between mt-10">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
          >
            Previous
          </button>

          <button
            onClick={goNext}
            className={`px-7 py-3 rounded-xl font-semibold shadow transition
              ${
                currentIndex === questions.length - 1
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 scale-[1.02]"
                  : "bg-sky-600 text-white hover:bg-sky-700"
              }
            `}
          >
            {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </div>

      {/* animation */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}