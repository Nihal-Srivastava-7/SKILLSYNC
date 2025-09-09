import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  // returns { showToast }
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((opts) => {
    // opts: { message, type = 'info', duration = 4000 }
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message: opts.message,
      type: opts.type || "info",
      duration: opts.duration || 4000,
    };
    setToasts((t) => [...t, toast]);
    // auto remove
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, toast.duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded shadow p-3 text-sm ${
              t.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : t.type === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-sky-50 text-sky-900 border border-sky-100"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
