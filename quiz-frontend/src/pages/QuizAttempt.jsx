import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerMap, setAnswerMap] = useState({});

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}/details/`);

        setAttempt(res.data);
        setQuestions(res.data.questions);

        const map = {};
        res.data.questions.forEach((q) => {
          map[q.question_id] = q.selected;
        });

        setAnswerMap(map);
        if (res.data.questions.length > 0) {
          setSelected(map[res.data.questions[0].question_id] ?? null);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Failed to load quiz.");
      }
    };

    fetchAttempt();
  }, [attemptId]);

  const saveAnswer = async (questionId, choiceIndex) => {
    try {
      await api.post(`/attempts/${attemptId}/answer/`, {
        question_id: questionId,
        selected: choiceIndex,
      });

      setAnswerMap((prev) => ({
        ...prev,
        [questionId]: choiceIndex,
      }));
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleSelect = (index) => {
    setSelected(index);
    saveAnswer(questions[currentIndex].question_id, index);
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
    try {
      await api.post(`/attempts/${attemptId}/finish/`);
      navigate(`/results/${attemptId}`);
    } catch (error) {
      alert("Error finishing quiz.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading quiz...
      </div>
    );

  if (!questions.length)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        No questions available.
      </div>
    );

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">

        {/* Question Progress */}
        <div className="text-sm text-gray-500 mb-2">
          Question {currentIndex + 1} / {questions.length}
        </div>

        {/* Question Text */}
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {q.question_text}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`w-full text-left p-4 rounded-lg border transition 
                ${
                  selected === index
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                }
              `}
            >
              {choice}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-between mt-8">

          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2 rounded-lg border 
              ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400"
              }
            `}
          >
            Previous
          </button>

          {/* Next or Finish */}
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={goNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
