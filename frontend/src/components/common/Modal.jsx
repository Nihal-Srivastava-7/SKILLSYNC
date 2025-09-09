import React from "react";
export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] max-w-lg">
        <button
          className="absolute top-2 right-2 text-gray-400"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
