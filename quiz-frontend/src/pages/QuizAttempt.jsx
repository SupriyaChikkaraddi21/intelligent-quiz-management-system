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

  // AUDIO CONTEXT for consistent beep
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

  // -------------------------------------------
  // LOAD ATTEMPT
  // -------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/attempt/${attemptId}/details/`);
        const data = res.data;

        setQuestions(data.questions);

        const map = {};
        data.questions.forEach((q) => (map[q.question_id] = q.selected));
        setAnswerMap(map);

        if (data.questions.length > 0)
          setSelected(map[data.questions[0].question_id] ?? null);

        const start = new Date(data.started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - start) / 1000);
        const remain = data.time_limit - elapsed;

        setTimeLeft(remain > 0 ? remain : 0);

        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load quiz.");
      }
    };

    load();
  }, [attemptId]);

  // -------------------------------------------
  // TIMER + BEEP
  // -------------------------------------------
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

  // -------------------------------------------
  // TIMEOUT
  // -------------------------------------------
  const handleTimeout = () => {
    clearInterval(timerRef.current);
    setQuizLocked(true);
    setShowTimeoutModal(true);

    setTimeout(async () => {
      try {
        await api.post(`/attempt/${attemptId}/finish/`, { timeout: true });
        navigate(`/results/${attemptId}?timeout=1`);
      } catch {
        alert("Auto-submit failed.");
      }
    }, 2000);
  };

  // -------------------------------------------
  // SAVE ANSWER
  // -------------------------------------------
  const saveAnswer = async (questionId, choiceIndex) => {
    try {
      await api.post(`/attempt/${attemptId}/answer/`, {
        question_id: questionId,
        selected: Number(choiceIndex),
      });
      setAnswerMap((p) => ({ ...p, [questionId]: choiceIndex }));
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleSelect = (index) => {
    if (quizLocked) return;
    initAudio();

    const q = questions[currentIndex];
    setSelected(index);
    saveAnswer(q.question_id, index);
  };

  // -------------------------------------------
  // NAVIGATION
  // -------------------------------------------
  const goNext = () => {
    initAudio();
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelected(answerMap[questions[next].question_id] ?? null);
    }
  };

  const goPrev = () => {
    initAudio();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setSelected(answerMap[questions[prev].question_id] ?? null);
    }
  };

  // -------------------------------------------
  // FINISH QUIZ
  // -------------------------------------------
  const finishQuiz = async () => {
    initAudio();
    if (quizLocked) return;

    clearInterval(timerRef.current);

    try {
      await api.post(`/attempt/${attemptId}/finish/`);
      navigate(`/results/${attemptId}`);
    } catch {
      alert("Error finishing quiz.");
    }
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------
  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  if (!questions.length)
    return <div className="min-h-screen flex items-center justify-center">No questions found.</div>;

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center relative">

      {/* TIMEOUT MODAL */}
      {showTimeoutModal && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold text-red-600 mb-3">⏳ Time's Up!</h2>
            <p className="text-gray-700">Submitting your quiz...</p>
            <div className="loader mx-auto mt-4"></div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Question {currentIndex + 1} / {questions.length}
          </div>

          {/* TIMER WITH FLASH ANIMATION */}
          <div
            className={`
              text-lg font-bold px-4 py-2 rounded-lg
              ${timeLeft > 60 ? "bg-blue-100 text-blue-700" : ""}
              ${timeLeft <= 60 && timeLeft > 20 ? "bg-yellow-100 text-yellow-700" : ""}
              ${timeLeft <= 20 ? "bg-red-100 text-red-700 flash-timer" : ""}
            `}
          >
            ⏳ {formatTime(timeLeft)}
          </div>
        </div>

        {/* QUESTION */}
        <h2 className="text-xl font-bold mb-6">{q.question_text}</h2>

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={quizLocked}
              className={`
                w-full text-left p-4 rounded-lg border transition
                ${
                  selected === index
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                }
                ${quizLocked ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {choice}
            </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex justify-between mt-8">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 || quizLocked}
            className={`
              px-4 py-2 rounded-lg border
              ${
                currentIndex === 0 || quizLocked
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400"
              }
            `}
          >
            Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={goNext}
              disabled={quizLocked}
              className={`
                px-4 py-2 text-white rounded-lg
                ${
                  quizLocked
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              Next
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              disabled={quizLocked}
              className={`
                px-4 py-2 text-white rounded-lg
                ${
                  quizLocked
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }
              `}
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes flashPulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        .flash-timer {
          animation: flashPulse 0.9s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .loader {
          border: 4px solid #ddd;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
