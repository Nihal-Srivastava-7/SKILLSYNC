import React, { useState } from "react";
import { suggest } from "../../services/aiService";

const AISuggestButton = ({ section, text, skills = [], onApply }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const handleClick = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await suggest({ section, text, skills });
      setList(Array.isArray(data?.suggestions) ? data.suggestions : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not fetch suggestions.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "AI Suggest"}
      </button>

      {error && <div className="mt-1 text-red-600 text-sm">{error}</div>}

      {list.length > 0 && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
          {list.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="block w-full text-left text-sm text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => onApply?.(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestButton;
