// src/components/QuestionBuilder.jsx
import React from "react";

export default function QuestionBuilder({
  index,
  question,
  onChange,
  onChoiceChange,
}) {
  const update = (key, value) => {
    onChange(index, key, value);
  };

  const updateChoice = (choiceIndex, value) => {
    onChoiceChange(index, choiceIndex, value);
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl space-y-6 border border-slate-700 shadow-lg">

      {/* QUESTION TEXT */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
          Question
        </label>
        <input
          value={question.question_text}
          onChange={(e) => update("question_text", e.target.value)}
          placeholder={`Question ${index + 1}`}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* QUESTION TYPE DISPLAY */}
      <div className="text-sm font-medium text-slate-400">
        Type:{" "}
        <span className="text-white font-semibold">
          {question.question_type === "mcq"
            ? "MCQ"
            : question.question_type === "true_false"
            ? "True / False"
            : "Type Answer"}
        </span>
      </div>

      {/* ================= MCQ ================= */}
      {question.question_type === "mcq" &&
        question.choices.map((choice, i) => {
          const isSelected = question.correct_choice === i;

          return (
            <div
              key={i}
              onClick={() => update("correct_choice", i)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-600/10 shadow-md"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/40"
                }`}
            >
              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    isSelected
                      ? "border-indigo-500"
                      : "border-slate-500"
                  }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                )}
              </div>

              {/* Input */}
              <input
                value={choice}
                onChange={(e) => updateChoice(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-transparent text-white placeholder-slate-400
                           focus:outline-none"
              />
            </div>
          );
        })}

      {/* ================= TRUE / FALSE ================= */}
      {question.question_type === "true_false" && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Correct Answer
          </label>
          <select
            value={question.correct_choice}
            onChange={(e) =>
              update("correct_choice", Number(e.target.value))
            }
            className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value={0}>True</option>
            <option value={1}>False</option>
          </select>
        </div>
      )}

      {/* ================= TYPE ANSWER ================= */}
      {question.question_type === "type_answer" && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Correct Answer
          </label>
          <input
            value={question.correct_text}
            onChange={(e) => update("correct_text", e.target.value)}
            placeholder="Correct Answer"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      )}

      {/* HINT */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
          Hint (optional)
        </label>
        <input
          value={question.hint}
          onChange={(e) => update("hint", e.target.value)}
          placeholder="Hint"
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* EXPLANATION */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
          Explanation (optional)
        </label>
        <textarea
          value={question.explanation}
          onChange={(e) => update("explanation", e.target.value)}
          placeholder="Explanation"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
        />
      </div>

      {/* DIFFICULTY */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
          Difficulty
        </label>
        <select
          value={question.difficulty}
          onChange={(e) => update("difficulty", e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-600
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

    </div>
  );
}
