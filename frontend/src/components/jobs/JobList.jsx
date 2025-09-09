import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getJobSuggestions } from "../../services/jobService";
import Loader from "../common/Loader";
import { useAuth } from "../../hooks/useAuth";

export default function JobList({ skills: propSkills = [] }) {
  const { user } = useAuth();

  const [allJobs, setAllJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [useMySkills, setUseMySkills] = useState(true);
  const [query, setQuery] = useState("");

  // pagination settings
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  const readSavedSkills = useCallback(() => {
    try {
      const raw = localStorage.getItem("resume");
      if (raw) {
        const r = JSON.parse(raw || "{}");
        if (Array.isArray(r?.skills) && r.skills.length > 0) return r.skills;
      }
    } catch (e) {
      // ignore
    }
    try {
      const raw2 = localStorage.getItem("skills");
      if (raw2) {
        const s = JSON.parse(raw2);
        if (Array.isArray(s) && s.length > 0) return s;
      }
    } catch (e) {}
    return Array.isArray(propSkills) ? propSkills : [];
  }, [propSkills]);

  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      const skillsToSend = useMySkills ? readSavedSkills() : [];

      try {
        let res;

        if (Array.isArray(skillsToSend) && skillsToSend.length > 0) {
          try {
            res = await getJobSuggestions(skillsToSend, page);
          } catch (svcErr) {
            res = await axios.post(
              `${baseURL}/jobs/suggest?page=${page}&results_per_page=${pageSize}`,
              { skills: skillsToSend },
              { headers: { "Content-Type": "application/json" } }
            );
          }
        } else {
          res = await axios.get(`${baseURL}/jobs`, {
            params: {
              page,
              results_per_page: pageSize,
            },
          });
        }

        const jobs = res?.data?.jobs || [];
        const count = Number(res?.data?.count ?? res?.data?.total ?? null);

        // server-mode if backend returns a numeric count > 0
        setAllJobs(jobs);
        setDisplayJobs(jobs);
        setTotalCount(!Number.isNaN(count) && count > 0 ? count : null);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch jobs"
        );

        // final fallback: small mock so UI stays usable
        const mock = [
          {
            id: "mock-1",
            title: "Frontend Developer (Mock)",
            company: "MockCorp",
            location: "Remote",
            url: "https://example.com/jobs/mock-frontend",
            description: "Example job when API is unavailable.",
            skills: ["React", "JavaScript"],
          },
          {
            id: "mock-2",
            title: "Backend Developer (Mock)",
            company: "MockInc",
            location: "Remote",
            url: "https://example.com/jobs/mock-backend",
            description: "Example job when API is unavailable.",
            skills: ["Node.js", "MongoDB"],
          },
        ];
        setAllJobs(mock);
        setDisplayJobs(mock);
        setTotalCount(mock.length);
      } finally {
        setLoading(false);
      }
    },
    [useMySkills, readSavedSkills, baseURL]
  );

  const searchJobs = useCallback(
    async (q) => {
      const trimmed = (q || "").trim();
      if (!trimmed) {
        await fetchJobs(1);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${baseURL}/jobs`, {
          params: { q: trimmed, page: 1, results_per_page: 50 },
        });

        const jobs = res?.data?.jobs || [];
        // if user requested "with my skills", filter those server search results by skills
        if (useMySkills) {
          const saved = readSavedSkills().map((s) => String(s).toLowerCase());
          const filtered = jobs.filter((j) => {
            const jskills = (j.skills || [])
              .map((s) => String(s).toLowerCase())
              .concat(
                // also check title/company/description for keywords matching any saved skill
                (
                  (j.title || "") +
                  " " +
                  (j.company || "") +
                  " " +
                  (j.description || "")
                )
                  .toLowerCase()
                  .split(/\W+/)
              );
            return saved.some((sk) => jskills.includes(sk));
          });

          setAllJobs(filtered);
          setDisplayJobs(filtered);
          setTotalCount(filtered.length);
          setCurrentPage(1);
        } else {
          // Show server results; backend may return count for server-mode pagination
          const count = Number(res?.data?.count ?? null);
          setAllJobs(jobs);
          setDisplayJobs(jobs);
          setTotalCount(!Number.isNaN(count) && count > 0 ? count : null);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Search failed"
        );
        // fallback: keep previous displayJobs or empty
        setAllJobs([]);
        setDisplayJobs([]);
        setTotalCount(null);
      } finally {
        setLoading(false);
      }
    },
    [baseURL, readSavedSkills, useMySkills, fetchJobs]
  );

  // initial load and refresh on useMySkills toggle
  useEffect(() => {
    fetchJobs(1);
    const onStorage = (e) => {
      if (e.key === "resume" || e.key === "skills") {
        fetchJobs(1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchJobs, useMySkills]);

  // When user submits search
  const handleSearch = async (e) => {
    e?.preventDefault?.();
    await searchJobs(query);
  };

  // Reset search / UI
  const handleReset = () => {
    setQuery("");

    if (totalCount && totalCount > 0) {
      fetchJobs(1);
    } else {
      setDisplayJobs(allJobs);
      setCurrentPage(1);
    }
  };

  // pagination computation
  const serverMode = typeof totalCount === "number" && totalCount > 0;
  const totalPages = serverMode
    ? Math.max(1, Math.ceil(totalCount / pageSize))
    : Math.max(1, Math.ceil(displayJobs.length / pageSize));

  // Determine items for current page
  const pageItems = serverMode
    ? allJobs // server returns only this page's jobs
    : displayJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // compute sliding window pagesToShow (max 9 buttons)
  const computePagesToShow = () => {
    if (totalPages <= 9) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = 4;
    let start = currentPage - half;
    let end = currentPage + half;
    if (start < 1) {
      start = 1;
      end = 9;
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - 8);
    }
    const arr = [];
    for (let p = start; p <= end; p += 1) arr.push(p);
    return arr;
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[#1E3A8A]">Jobs</h2>
          <div>
            <button
              onClick={() => {
                setUseMySkills(true);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded ${
                useMySkills ? "bg-[#1E3A8A] text-white" : "bg-gray-100"
              }`}
            >
              With my skills
            </button>

            <button
              onClick={() => {
                setUseMySkills(false);
                setCurrentPage(1);
              }}
              className={`ml-2 px-3 py-1 rounded ${
                !useMySkills ? "bg-[#1E3A8A] text-white" : "bg-gray-100"
              }`}
            >
              Show all jobs
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            placeholder="Search title, company, location or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-60"
            aria-label="Search jobs"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded bg-sky-500 text-white"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded bg-gray-200"
          >
            Reset
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{error}</div>
      )}

      {pageItems.length === 0 ? (
        <div className="text-gray-600">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pageItems.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  {/* <div className="font-semibold text-[#1E3A8A]">
                    {job.title}
                  </div>
                  <div className="text-sm text-gray-600">{job.company}</div>
                  <div className="text-xs text-gray-500">{job.location}</div> */}
                  <div className="font-semibold text-[#1E3A8A]">
                    {typeof job.title === "string"
                      ? job.title
                      : JSON.stringify(job.title)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {typeof job.company === "string"
                      ? job.company
                      : JSON.stringify(job.company)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {typeof job.location === "string"
                      ? job.location
                      : JSON.stringify(job.location)}
                  </div>
                  {job.description ? (
                    // <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    //   {job.description}
                    // </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                      {typeof job.description === "string"
                        ? job.description
                        : JSON.stringify(job.description)}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {(job.skills || []).slice(0, 3).join(", ")}
                    {(job.skills || []).length > 3 ? "..." : ""}
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-sm text-sky-500 hover:underline"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            const next = Math.max(1, currentPage - 1);
            setCurrentPage(next);
            if (serverMode) fetchJobs(next);
          }}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {computePagesToShow().map((p) => (
          <button
            key={p}
            onClick={() => {
              setCurrentPage(p);
              if (serverMode) fetchJobs(p);
            }}
            className={`px-3 py-1 rounded ${
              p === currentPage ? "bg-[#1E3A8A] text-white" : "bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => {
            const next = Math.min(totalPages, currentPage + 1);
            setCurrentPage(next);
            if (serverMode) fetchJobs(next);
          }}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-gray-500">
        {serverMode
          ? `Showing page ${currentPage} of ${totalPages} — ${totalCount} jobs`
          : `Showing ${displayJobs.length} jobs`}
      </div>
    </div>
  );
}
