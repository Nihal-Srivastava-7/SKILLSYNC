import React from "react";
import { useToast } from "./Toast";

export default function ResumePDFButton({ resume, resumeHtml }) {
  const { showToast } = useToast();

  const handlePrint = () => {
    const html =
      resumeHtml ||
      (typeof document !== "undefined" &&
        document.getElementById("resume-preview")?.innerHTML) ||
      (resume
        ? `<pre>${JSON.stringify(resume, null, 2)}</pre>`
        : "<p>No resume to export</p>");

    const w = window.open("", "_blank");
    if (!w) {
      showToast({
        message: "Popup blocked. Allow popups for this site.",
        type: "error",
      });
      return;
    }
    w.document.write(`
      <html><head><title>Resume</title>
      <style>body{font-family: Arial, Helvetica, sans-serif; padding:20px;}</style>
      </head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
        showToast({ message: "Print dialog opened", type: "success" });
      } catch (e) {
        showToast({ message: "Unable to open print dialog", type: "error" });
      }
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="px-3 py-2 bg-gray-800 text-white rounded"
    >
      Export PDF
    </button>
  );
}
