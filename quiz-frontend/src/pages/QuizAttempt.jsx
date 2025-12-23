// src/pages/QuizAttempt.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerMap, setAnswerMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [quizLocked, setQuizLocked] = useState(false);

  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
  };

  const beep = (frequency = 1200, duration = 0.12) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  // ---------------- LOAD ATTEMPT
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/attempt/${attemptId}/details/`);
        const data = res.data;

        setQuestions(data.questions);

        const map = {};
        data.questions.forEach((q) => (map[q.question_id] = q.selected));
        setAnswerMap(map);

        if (data.questions.length > 0) {
          setSelected(map[data.questions[0].question_id] ?? null);
        }

        const start = new Date(data.started_at).getTime();
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const remain = data.time_limit - elapsed;

        setTimeLeft(remain > 0 ? remain : 0);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load quiz.");
      }
    };

    load();
  }, [attemptId]);

  // ---------------- TIMER
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    if (timeLeft === 10) beep(800);
    if (timeLeft === 5) beep(1200);
    if (timeLeft <= 4 && timeLeft >= 1) beep(1500);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleTimeout = async () => {
    clearInterval(timerRef.current);
    setQuizLocked(true);
    setShowTimeoutModal(true);

    setTimeout(async () => {
      await api.post(`/attempt/${attemptId}/finish/`, { timeout: true });
      navigate(`/results/${attemptId}?timeout=1`);
    }, 2000);
  };

  const saveAnswer = async (questionId, choiceIndex) => {
    await api.post(`/attempt/${attemptId}/answer/`, {
      question_id: questionId,
      selected: Number(choiceIndex),
    });
    setAnswerMap((p) => ({ ...p, [questionId]: choiceIndex }));
  };

  const handleSelect = (index) => {
    if (quizLocked) return;
    initAudio();
    const q = questions[currentIndex];
    setSelected(index);
    saveAnswer(q.question_id, index);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelected(answerMap[questions[next].question_id] ?? null);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setSelected(answerMap[questions[prev].question_id] ?? null);
    }
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    await api.post(`/attempt/${attemptId}/finish/`);
    navigate(`/results/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-300">
        Loading…
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-slate-300">
            Question {currentIndex + 1} / {questions.length}
          </span>

          <span className="px-4 py-2 rounded-lg font-semibold bg-blue-500/20 text-blue-300">
            ⏳ {formatTime(timeLeft)}
          </span>
        </div>

        {/* QUESTION */}
        <h2 className="text-xl font-semibold mb-6 text-white">
          {q.question_text}
        </h2>

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={quizLocked}
              className={`w-full text-left px-5 py-4 rounded-xl border transition
                ${
                  selected === index
                    ? "bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }
                ${quizLocked ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {choice}
            </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex justify-between mt-10">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 || quizLocked}
            className="px-5 py-2 rounded-lg bg-white/10 text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={goNext}
              disabled={quizLocked}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              disabled={quizLocked}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
