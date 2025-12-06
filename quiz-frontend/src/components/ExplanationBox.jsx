import React from "react";

export default function ExplanationBox({ explanation, onClose }) {
  if (!explanation) return null;

  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#1F3A5F]">Explanation</h4>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {explanation}
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-4 text-xs px-2 py-1 border rounded-md text-gray-500 hover:bg-gray-50"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
