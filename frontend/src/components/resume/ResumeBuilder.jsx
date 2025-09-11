import React, { useEffect, useState } from "react";
import {
  getMyResume,
  savePersonal,
  addEducation,
  deleteEducation,
  setSkills,
  listTemplates,
  applyTemplate,
  addProject,
  deleteProject,
} from "../../services/resumeService";
import { suggest } from "../../services/aiService";
import ResumePDFButton from "../../components/common/ResumePDFButton";
import Loader from "../common/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../common/Toast";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { showToast } = useToast();

  // AI states
  const [aiHeadlineSuggestion, setAiHeadlineSuggestion] = useState(null);
  const [aiHeadlineLoading, setAiHeadlineLoading] = useState(false);
  const [aiSummarySuggestion, setAiSummarySuggestion] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiTitleSuggestion, setAiTitleSuggestion] = useState(null);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);

  // Local form state
  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
  });
  const [newEdu, setNewEdu] = useState({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    link: "",
    techStack: "",
    summary: "",
  });

  // Persist resume to localStorage helper
  const persistResumeToLocal = (obj) => {
    try {
      localStorage.setItem("resume", JSON.stringify(obj || {}));
    } catch (e) {
      // ignore localStorage errors
      console.warn("Failed to persist resume to localStorage", e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [r, t] = await Promise.all([getMyResume(), listTemplates()]);
        setResume(r.data || {});
        setTemplates(t.data || []);
        if (r.data?.personal) setPersonal(r.data.personal);
        if (r.data?.skills) setSkillsInput((r.data.skills || []).join(", "));
        // persist fetched resume to localStorage (so JobList & other components can read it)
        persistResumeToLocal(r.data || {});
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate("/login", {
            state: {
              message: "Session expired or unauthorized. Please login again.",
            },
          });
        } else {
          console.error(err);
          setNotice({ type: "error", text: "Failed to load resume." });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyTemplate = async (templateId) => {
    if (!templateId) return;
    try {
      await applyTemplate(templateId);
      const r = await getMyResume();
      setResume(r.data || {});
      if (r.data?.personal) setPersonal(r.data.personal);
      if (r.data?.skills) setSkillsInput((r.data.skills || []).join(", "));
      persistResumeToLocal(r.data || {});
      showToast({ message: "Template applied.", type: "success" });
    } catch (err) {
      console.error(err);
      showToast({ message: "Failed to apply template.", type: "error" });
    }
  };

  // Enforce skills required when saving personal
  const handleSavePersonal = async () => {
    const trimmedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (trimmedSkills.length === 0) {
      showToast({
        message: "Skills are required to save your resume.",
        type: "error",
      });
      return;
    }
    try {
      const res = await savePersonal(personal);
      const updated = {
        ...(resume || {}),
        personal: res.data,
        skills: trimmedSkills,
      };
      setResume(updated);
      // persist skills server-side too if changed
      await setSkills(trimmedSkills);
      persistResumeToLocal(updated);
      showToast({ message: "Personal info saved.", type: "success" });
    } catch (err) {
      console.error("Save personal failed", err);
      showToast({ message: "Failed to save personal info.", type: "error" });
    }
  };

  const handleAddEducation = async () => {
    const payload = {
      ...newEdu,
      startDate: newEdu.startDate
        ? new Date(newEdu.startDate).toISOString()
        : null,
      endDate: newEdu.endDate ? new Date(newEdu.endDate).toISOString() : null,
    };
    try {
      const res = await addEducation(payload);
      setResume((prev) => ({ ...prev, education: res.data }));
      setNewEdu({
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      showToast({ message: "Education added.", type: "success" });
    } catch (err) {
      console.error("Add education failed", err);
      showToast({ message: "Failed to add education.", type: "error" });
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await deleteEducation(id);
      const updated = {
        ...(resume || {}),
        education: (resume?.education || []).filter((e) => e._id !== id),
      };
      setResume(updated);
      persistResumeToLocal(updated);
      showToast({ message: "Education deleted.", type: "info" });
    } catch (err) {
      console.error("Delete education failed", err);
      showToast({ message: "Failed to delete education.", type: "error" });
    }
  };

  const handleSetSkills = async () => {
    const arr = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length === 0) {
      showToast({ message: "Skills are required.", type: "error" });
      return;
    }
    try {
      const res = await setSkills(arr);
      const newSkills = res.data || arr;
      const updated = { ...(resume || {}), skills: newSkills };
      setResume(updated);
      persistResumeToLocal(updated);
      showToast({ message: "Skills updated.", type: "success" });
    } catch (err) {
      console.error("Set skills failed", err);
      showToast({ message: "Failed to save skills.", type: "error" });
    }
  };

  const handleAddProject = async () => {
    const payload = {
      ...newProject,
      techStack: newProject.techStack
        ? newProject.techStack
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [],
    };
    try {
      const res = await addProject(payload);
      const updatedProjects = res.data || [];
      const updated = { ...(resume || {}), projects: updatedProjects };
      setResume(updated);
      persistResumeToLocal(updated);
      setNewProject({ title: "", link: "", techStack: "", summary: "" });
      showToast({ message: "Project added.", type: "success" });
    } catch (err) {
      console.error("Add project failed", err);
      showToast({ message: "Failed to add project.", type: "error" });
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      const updated = {
        ...(resume || {}),
        projects: (resume?.projects || []).filter((p) => p._id !== id),
      };
      setResume(updated);
      persistResumeToLocal(updated);
      showToast({ message: "Project deleted.", type: "info" });
    } catch (err) {
      console.error("Delete project failed", err);
      showToast({ message: "Failed to delete project.", type: "error" });
    }
  };

  // AI Suggest project summary (existing handlers you had)

  const handleAISuggestProject = async () => {
    setNotice(null);
    setAiSuggestion(null);
    setAiError("");

    if (!newProject.summary && !newProject.title) {
      setAiError(
        "Please add a project title or summary to get AI suggestions."
      );
      showToast({
        message: "Add Title or summary to get AI suggestions",
        type: "info",
      });
      return;
    }

    setAiLoading(true);
    try {
      const payload = {
        section: "project",
        text: `${newProject.title || ""}\n\n${newProject.summary || ""}`,
        skills: resume?.skills || [],
      };

      const res = await suggest(payload);
      const suggestions = res.data?.suggestions;
      const source = res.data?.source || "ai";

      if (suggestions && typeof suggestions === "object") {
        // Only replace title if user didn’t give one
        const finalTitle = newProject.title || suggestions.title || "";
        const finalSummary = suggestions.summary || newProject.summary || "";

        setNewProject((p) => ({
          ...p,
          title: finalTitle,
          summary: finalSummary,
        }));

        setAiSuggestion({
          title: finalTitle,
          summary: finalSummary,
          source,
        });

        showToast({
          message: `AI suggestions applied (${source})`,
          type: "success",
        });
        setNotice({
          type: "info",
          text: `AI suggestions applied (${source}).`,
        });
      } else {
        setAiError("AI returned no usable suggestions.");
        setNotice({
          type: "error",
          text: "AI returned no usable suggestions.",
        });
        showToast({
          message: "AI returned no usable suggestions.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("AI request failed:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        "AI request failed";
      setAiError(msg);
      setNotice({ type: "error", text: msg });
      showToast({ message: msg, type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  // Save all (personal + skills) — skills required
  const handleSaveAll = async () => {
    try {
      const arr = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (arr.length === 0) {
        showToast({
          message: "Skills are required to save your resume.",
          type: "error",
        });
        return;
      }

      const personalRes = await savePersonal(personal);
      const skillsRes = await setSkills(arr);
      const updated = {
        ...(resume || {}),
        personal: personalRes.data,
        skills: skillsRes.data || arr,
      };
      setResume(updated);
      persistResumeToLocal(updated);
      showToast({ message: "Resume saved", type: "success" });
    } catch (err) {
      console.error("Save all failed", err);
      showToast({ message: "Failed to save resume", type: "error" });
    }
  };

  // AI suggest for personal summary
  const handleAISuggestSummary = async () => {
    setNotice(null);
    setAiSummarySuggestion(null);
    if (!personal.summary || !personal.summary.trim()) {
      setNotice({ type: "info", text: "Add a summary to get AI suggestions." });
      showToast({
        message: "Add a summary to get AI suggestions.",
        type: "info",
      });
      return;
    }
    setAiSummaryLoading(true);
    try {
      const payload = {
        section: "summary",
        text: personal.summary,
        skills: resume?.skills || [],
      };
      const res = await suggest(payload);
      const suggestions = res.data?.suggestions;
      const source = res.data?.source || "ai";
      if (suggestions) {
        const newSummary =
          typeof suggestions === "string"
            ? suggestions
            : suggestions.summary || suggestions;
        setPersonal((p) => ({ ...p, summary: newSummary }));
        setAiSummarySuggestion({ summary: newSummary, source });
        showToast({
          message: `AI summary applied (${source}).`,
          type: "success",
        });
        setNotice({ type: "info", text: `AI summary applied (${source}).` });
        // persist change (optional) - do not auto-save to server here, only local state
        const updated = {
          ...(resume || {}),
          personal: {
            ...(resume?.personal || {}),
            ...personal,
            summary: newSummary,
          },
        };
        persistResumeToLocal(updated);
      } else {
        setNotice({
          type: "error",
          text: "AI returned no suggestion for summary.",
        });
        showToast({
          message: "AI returned no suggestion for summary.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("AI summary request failed:", err);
      const msg =
        err.response?.data?.message || err.message || "AI request failed";
      setNotice({ type: "error", text: msg });
      showToast({ message: msg, type: "error" });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // AI suggest for project title only
  const handleAISuggestTitle = async () => {
    setNotice(null);
    setAiTitleSuggestion(null);
    if (!newProject.title && !newProject.summary) {
      setNotice({
        type: "info",
        text: "Add a title or summary for the project to get AI suggestions.",
      });
      showToast?.({
        message: "Add a title or summary to get AI suggestions",
        type: "info",
      });
      return;
    }
    setAiTitleLoading(true);
    try {
      const payload = {
        section: "project",
        text: `${newProject.title || ""}\n\n${newProject.summary || ""}`,
        skills: resume?.skills || [],
      };
      const res = await suggest(payload);
      const suggestions = res.data?.suggestions;
      const source = res.data?.source || "ai";
      if (suggestions && typeof suggestions === "object" && suggestions.title) {
        setNewProject((p) => ({ ...p, title: suggestions.title }));
        setAiTitleSuggestion({ title: suggestions.title, source });
        showToast?.({
          message: `AI title applied (${source})`,
          type: "success",
        });
        setNotice({ type: "info", text: `AI title applied (${source}).` });
      } else {
        const altTitle =
          (typeof suggestions === "string"
            ? suggestions
            : suggestions?.summary) || "";
        const heurTitle =
          altTitle.split(/[.\n]/)[0].slice(0, 80) || "Improved Project Title";
        setNewProject((p) => ({ ...p, title: heurTitle }));
        setAiTitleSuggestion({ title: heurTitle, source });
        showToast?.({
          message: `AI title applied (${source})`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("AI title request failed:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        "AI request failed";
      setNotice({ type: "error", text: msg });
      showToast?.({ message: msg, type: "error" });
    } finally {
      setAiTitleLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!resume) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* notice */}
      {notice && (
        <div
          className={`mb-4 p-3 rounded ${
            notice.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-sky-50 text-sky-900"
          }`}
        >
          {notice.text}
        </div>
      )}
      {/* mobile profile header */}
      <div className="flex items-center gap-2 mb-4 sm:hidden">
        <span className="bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </span>
        <span className="text-blue-900 font-semibold">Profile</span>
      </div>

      {/* top actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
          Resume Builder
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="border rounded-md px-3 py-2 text-sm bg-sky-50 focus:ring-2 focus:ring-blue-400"
            defaultValue={resume.template || ""}
            onChange={(e) => handleApplyTemplate(e.target.value)}
          >
            <option value="">Use a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {resume.template && (
            <div className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border">
              Template:{" "}
              <span className="font-medium ml-1">
                {templates.find((x) => x.id === resume.template)?.name ||
                  resume.template}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveAll}
              className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Save All
            </button>
            <ResumePDFButton resume={resume} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* left: forms */}
        <section className="bg-white rounded-xl shadow-sm border p-3 sm:p-5 text-sm sm:text-base">
          {/* Personal Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={personal.fullName}
                  onChange={(e) =>
                    setPersonal({ ...personal, fullName: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) =>
                    setPersonal({ ...personal, email: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) =>
                    setPersonal({ ...personal, phone: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="(123) 456-7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={personal.location}
                  onChange={(e) =>
                    setPersonal({ ...personal, location: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Headline & Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Headline & Summary
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={personal.headline}
                  onChange={(e) =>
                    setPersonal({ ...personal, headline: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  value={personal.summary}
                  onChange={(e) =>
                    setPersonal({ ...personal, summary: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  rows="3"
                  placeholder="A brief summary about yourself"
                />
              </div>
            </div>
          </div>

          {/* Save & AI Suggest */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSavePersonal}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-blue-900 text-white hover:bg-blue-700 transition"
            >
              Save Personal
            </button>

            <button
              onClick={handleAISuggestSummary}
              className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
              disabled={aiSummaryLoading}
            >
              {aiSummaryLoading ? "Thinking..." : "AI Suggest Summary"}
            </button>

            {aiSummarySuggestion && (
              <div
                className="ml-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm 
                  max-w-full sm:max-w-md md:max-w-sm lg:max-w-lg 
                  overflow-hidden"
              >
                <div className="font-semibold text-green-800 whitespace-normal break-words text-xs sm:text-sm md:text-base">
                  {aiSummarySuggestion.summary.length > 90
                    ? aiSummarySuggestion.summary.slice(0, 90) + "…"
                    : aiSummarySuggestion.summary}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Source: {aiSummarySuggestion.source}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
        <div className="mb-6">
  <h2 className="text-xl font-semibold text-blue-900 mb-4">Skills</h2>
  <div className="flex flex-col space-y-3">
    <input
      type="text"
      value={skillsInput}
      onChange={(e) => setSkillsInput(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
      placeholder="Comma separated (React, Node, MongoDB)"
    />
    <button
      onClick={handleSetSkills}
      className="w-full sm:w-auto px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      Save Skills
    </button>
  </div>



            <div className="mt-4">
              {resume.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-sky-50 border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Education
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School
                  </label>
                  <input
                    type="text"
                    value={newEdu.school}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, school: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="Harvard University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={newEdu.degree}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, degree: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="Bachelor of Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={newEdu.field}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, field: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={newEdu.startDate}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, startDate: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="YYYY-MM"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddEducation}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Add Education
                </button>
              </div>
            </div>

            {resume.education?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Education History
                </h3>
                <ul className="space-y-2">
                  {resume.education.map((e) => (
                    <li key={e._id} className="flex items-center gap-2">
                      <span className="text-sm font-medium">{e.school}</span>
                      {e.degree && <span className="text-xs">{e.degree}</span>}
                      {e.field && <span className="text-xs">({e.field})</span>}
                      <button
                        onClick={() => handleDeleteEducation(e._id)}
                        className="text-red-600 hover:text-red-800 transition ml-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Projects
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="Project Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    value={newProject.link}
                    onChange={(e) =>
                      setNewProject({ ...newProject, link: e.target.value })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    value={newProject.techStack}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        techStack: e.target.value,
                      })
                    }
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  value={newProject.summary}
                  onChange={(e) =>
                    setNewProject({ ...newProject, summary: e.target.value })
                  }
                  className="block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  rows="3"
                  placeholder="A brief summary of the project"
                />
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Add Project
                </button>
                <button
                  onClick={handleAISuggestProject}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  disabled={aiLoading}
                >
                  {aiLoading ? "Thinking..." : "AI Suggest Summary"}
                </button>
              </div>
            </div>

            {resume.projects?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Project Showcase
                </h3>
                <ul className="space-y-2">
                  {resume.projects.map((p) => (
                    <li key={p._id} className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.title}</span>
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="text-red-600 hover:text-red-800 transition ml-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* right: preview */}
        <section
          className="bg-white rounded-xl shadow-sm border p-3 sm:p-5 text-sm sm:text-base overflow-x-auto"
          id="resume-preview"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-3">Preview</h3>

          {/* Template: Classic (default) */}
          {(!resume.template || resume.template === "tpl1") && (
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <h4 className="text-2xl font-bold text-blue-900">
                  {resume.personal?.fullName || "Your Name"}
                </h4>
                <p className="text-sm text-gray-600">
                  {[
                    resume.personal?.email,
                    resume.personal?.phone,
                    resume.personal?.location,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className="text-blue-900 font-medium mt-2">
                  {resume.personal?.headline}
                </p>
                <p className="text-sm mt-1">{resume.personal?.summary}</p>
              </div>

              {resume.skills?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold text-blue-900">Skills</h5>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resume.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-sky-50 border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.education?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold text-blue-900">Education</h5>
                  <ul className="mt-2 space-y-2">
                    {resume.education.map((e) => (
                      <li key={e._id} className="text-sm">
                        <span className="font-medium">{e.school}</span>
                        {e.degree ? ` • ${e.degree}` : ""}
                        {e.field ? ` (${e.field})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resume.projects?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-blue-900">Projects</h5>
                  <ul className="mt-2 space-y-2">
                    {resume.projects.map((p) => (
                      <li key={p._id} className="text-sm">
                        <span className="font-medium">{p.title}</span>
                        {p.link ? (
                          <>
                            {" "}
                            —{" "}
                            <a
                              className="text-sky-500 hover:underline"
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {p.link}
                            </a>
                          </>
                        ) : null}
                        {p.summary ? (
                          <p className="text-gray-700">{p.summary}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Template: Modern */}
          {resume.template === "tpl2" && (
            <div className="border rounded-lg p-6 text-center">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">
                {resume.personal?.fullName || "Your Name"}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {resume.personal?.headline}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {resume.personal?.summary}
              </p>
              {resume.skills?.length > 0 && (
                <div className="mt-4 flex justify-center flex-wrap gap-2">
                  {resume.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-[#38BDF8] text-white"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 text-left">
                <h4 className="font-semibold text-blue-900">Projects</h4>
                <ul className="mt-2 space-y-3">
                  {resume.projects.map((p) => (
                    <li key={p._id} className="text-sm">
                      <div className="font-medium">{p.title}</div>
                      {p.summary && (
                        <div className="text-gray-700 italic text-sm mt-1">
                          {p.summary}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Template: Creative */}
          {resume.template === "tpl3" && (
            <div className="flex border rounded-lg overflow-hidden">
              <div className="w-2 bg-[#1E3A8A]" />
              <div className="p-4 flex-1">
                <h3 className="text-2xl font-bold text-[#1E3A8A]">
                  {resume.personal?.fullName || "Your Name"}
                </h3>
                <p className="text-sm text-gray-600">
                  {resume.personal?.headline}
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-blue-900">Skills</h5>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resume.skills.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-sky-50 border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-900">Education</h5>
                    <ul className="mt-2 space-y-2 text-sm">
                      {resume.education.map((e) => (
                        <li key={e._id}>
                          <span className="font-medium">{e.school}</span>
                          {e.degree ? ` • ${e.degree}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="font-semibold text-blue-900">Projects</h5>
                  <ul className="mt-2 space-y-2">
                    {resume.projects.map((p) => (
                      <li key={p._id} className="text-sm">
                        <div className="font-medium">{p.title}</div>
                        {p.summary && (
                          <div className="text-gray-700">{p.summary}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
