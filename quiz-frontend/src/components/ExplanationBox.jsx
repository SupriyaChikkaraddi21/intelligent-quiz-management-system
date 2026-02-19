import React from "react";

export default function ExplanationBox({ explanation, onClose }) {
  if (!explanation) return null;

  return (
    <div className="mt-4 p-4 rounded-lg
                    border border-sky-200
                    bg-sky-50 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Explanation
          </h4>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            {explanation}
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-4 text-xs px-3 py-1
                     rounded-md border border-sky-200
                     text-slate-600
                     hover:bg-sky-100 transition"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
