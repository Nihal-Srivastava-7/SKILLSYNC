const express = require("express");
const axios = require("axios");
const router = express.Router();

const JOB_API_URL = process.env.JOB_API_URL || "";
const APP_ID = process.env.JOB_API_APP_ID || "";
const APP_KEY = process.env.JOB_API_APP_KEY || "";
const COUNTRY = process.env.JOB_API_COUNTRY || "in";

const MOCK_JOBS = [
  {
    id: "m1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    url: "https://example.com/jobs/frontend",
    description: "Build modern UIs with React and JavaScript.",
    skills: ["react", "javascript", "css"],
  },
  {
    id: "m2",
    title: "Backend Developer",
    company: "DataSoft",
    location: "Bangalore",
    url: "https://example.com/jobs/backend",
    description: "Work on Node.js APIs and MongoDB.",
    skills: ["node.js", "mongodb", "express"],
  },
  {
    id: "m3",
    title: "Fullstack Engineer",
    company: "InnovateX",
    location: "Delhi",
    url: "https://example.com/jobs/fullstack",
    description: "React + Node.js fullstack role.",
    skills: ["react", "node.js", "mongodb"],
  },
];

// small helper to extract simple tech tokens from job description/title
function extractSkillsFromText(text = "") {
  const keywords = [
    "react",
    "javascript",
    "node",
    "node.js",
    "express",
    "mongodb",
    "mongo",
    "sql",
    "mysql",
    "postgres",
    "python",
    "django",
    "flask",
    "java",
    "spring",
    "aws",
    "docker",
    "kubernetes",
    "php",
    "html",
    "css",
    "typescript",
    "angular",
    "ruby",
    "golang",
    "go",
  ];
  const lowered = (text || "").toLowerCase();
  return keywords.filter((k) => lowered.includes(k));
}

function mapAdzunaResultToJob(j) {
  const description = j.description || j.description_plain || "";
  const skills = extractSkillsFromText(`${j.title || ""} ${description}`);
  return {
    id: j.id,
    title: j.title,
    company: j.company?.display_name || j.company,
    location: j.location?.display_name || (j.location ? j.location : ""),
    url: j.redirect_url || j.redirectUrl || j.redirectUrl,
    description,
    skills,
  };
}

async function fetchFromExternal({
  page = 1,
  what = "",
  where = "India",
  results_per_page = 10,
}) {
  if (!JOB_API_URL || !APP_ID || !APP_KEY) {
    // If credentials missing
    throw new Error("External job API not configured (missing env vars)");
  }

  const url = `${JOB_API_URL}/${COUNTRY}/search/${page}`;

  const { data } = await axios.get(url, {
    params: {
      app_id: APP_ID,
      app_key: APP_KEY,
      results_per_page,
      what,
      where,
    },
    timeout: 8000,
  });

  // Adzuna returns results array (and count)
  const results = Array.isArray(data.results)
    ? data.results.map(mapAdzunaResultToJob)
    : [];
  return { jobs: results, count: data.count || results.length };
}

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page || "1", 10) || 1;
  const q = req.query.q || "";
  const location = req.query.location || "India";
  const results_per_page =
    parseInt(req.query.results_per_page || "10", 10) || 10;

  try {
    const out = await fetchFromExternal({
      page,
      what: q,
      where: location,
      results_per_page,
    });
    return res.json(out);
  } catch (err) {
    console.warn("Job API error or not configured:", err.message || err);
    // fallback to mock data (support pagination slice)
    const start = (page - 1) * results_per_page;
    const slice = MOCK_JOBS.slice(start, start + results_per_page);
    return res.json({ jobs: slice, count: MOCK_JOBS.length });
  }
});

router.post("/suggest", async (req, res) => {
  const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
  const page = parseInt(req.query.page || "1", 10) || 1;
  const results_per_page =
    parseInt(req.query.results_per_page || "10", 10) || 10;

  // If no skills, return general jobs
  const what = skills.length ? skills.join(" OR ") : "";

  try {
    const out = await fetchFromExternal({
      page,
      what,
      where: "India",
      results_per_page,
    });
    return res.json(out);
  } catch (err) {
    console.warn("Job Suggestion external failure:", err.message || err);

    let filtered = MOCK_JOBS;
    if (skills.length) {
      const lowerSkills = skills.map((s) => s.toLowerCase());
      filtered = MOCK_JOBS.filter((j) =>
        j.skills.some((s) => lowerSkills.includes(s.toLowerCase()))
      );
    }
    const start = (page - 1) * results_per_page;
    const slice = filtered.slice(start, start + results_per_page);
    return res.json({ jobs: slice, count: filtered.length });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // try external fetch first (page 1..3)
    for (let p = 1; p <= 3; p++) {
      try {
        const out = await fetchFromExternal({
          page: p,
          what: "",
          where: "India",
          results_per_page: 50,
        });
        const found = (out.jobs || []).find((j) => String(j.id) === String(id));
        if (found) return res.json(found);
      } catch (e) {
        break;
      }
    }

    const job = MOCK_JOBS.find((j) => String(j.id) === String(id));
    if (job) return res.json(job);

    return res.status(404).json({ error: "Job not found" });
  } catch (err) {
    console.error("Job Detail error:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch job detail" });
  }
});

module.exports = router;
