import React, { useState } from "react";
import AISuggestButton from "../ai/AISuggestButton";

const SummarySection = ({ initialText = "", skills = [], onChange }) => {
  const [summary, setSummary] = useState(initialText);

  const applySuggestion = (s) => {
    setSummary(s);
    onChange?.(s);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-indigo-700">
          Professional Summary
        </h3>
        <AISuggestButton
          section="summary"
          text={summary}
          skills={skills}
          onApply={applySuggestion}
        />
      </div>

      {/* Textarea */}
      <label
        htmlFor="summary"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Summary
      </label>
      <textarea
        id="summary"
        className="w-full min-h-[140px] resize-y rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 p-3 text-gray-800 text-sm"
        placeholder="Write a concise summary highlighting your key strengths and goals..."
        value={summary}
        onChange={(e) => {
          setSummary(e.target.value);
          onChange?.(e.target.value);
        }}
        rows={6}
        autoComplete="off"
      />
      <p className="mt-2 text-sm text-gray-500">
        Tip: Focus on achievements and measurable impact.
      </p>
    </div>
  );
};

export default SummarySection;
