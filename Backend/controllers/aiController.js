const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI;

/**
 * Helper: ensure global fetch is available
 */
function getFetch() {
  // Node 18+ provides global fetch
  if (typeof fetch === "function") return fetch;
  // fallback: do not require node-fetch here to avoid errors when it's not installed
  return null;
}

/**
 * Try to extract JSON from a model response.
 * Handles plain JSON or JSON inside markdown code fences.
 */
function extractJSONFromText(text) {
  if (!text || typeof text !== "string") return null;
  const t = text.trim();
  try {
    return JSON.parse(t);
  } catch (e) {}
  const fenceMatch = t.match(/(?:^|\n)```(?:json)?\n?([\s\S]*?)\n?```(?:\n|$)/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) {}
  }
  const braceMatch = t.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) {}
  }
  return null;
}

/* Mock helpers */
function mockImproveProject(text) {
  const raw = (text || "").replace(/\s+/g, " ").trim();
  const words = raw
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const title = (words.slice(0, 4).join(" ") || "Project").replace(
    /\b\w/g,
    (c) => c.toUpperCase()
  );
  const summary = `Led development of ${
    words.slice(0, 3).join(" ") || "the project"
  }, using relevant technologies; focused on performance and delivery with measurable outcomes.`;
  return { title: title.slice(0, 80), summary: summary.slice(0, 400) };
}

function mockImproveSummary(text) {
  const raw = (text || "").trim();
  if (!raw)
    return "Experienced professional with strong technical skills and measurable impact.";
  const keywords = raw
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6);
  return `Experienced professional skilled in ${
    keywords.join(", ") || "software development"
  }. Proven ability to deliver results and drive improvements.`;
}

function buildPrompt(section, text) {
  if (section === "project") {
    return [
      {
        role: "system",
        content:
          "You are an expert resume writer. Do NOT repeat the input verbatim. Produce improved, concise outputs focused on impact and technologies.",
      },
      {
        role: "user",
        content: `Return only valid JSON with keys "title" and "summary". Title: short (<=80 chars). Summary: 1-2 sentences emphasizing impact, technologies, and measurable result if possible. Input project text: ${text}`,
      },
    ];
  }
  if (section === "summary") {
    return [
      {
        role: "system",
        content:
          "You are an expert resume writer. Do NOT repeat the input verbatim. Produce concise two-sentence professional summaries.",
      },
      {
        role: "user",
        content: `Rewrite this summary into two concise sentences emphasizing impact and keywords: ${text}`,
      },
    ];
  }
  return [
    {
      role: "system",
      content:
        "You are an expert resume writer. Provide short actionable suggestions.",
    },
    {
      role: "user",
      content: `Provide 3 short suggestions to improve: ${text}`,
    },
  ];
}

/* Optional lightweight endpoint (fallback) */
exports.suggestImprovements = async (req, res) => {
  try {
    const { section, text, skills = [] } = req.body;

    if (!OPENAI_KEY) {
      return res.json({
        suggestions: [
          "Use strong action verbs (Built, Led, Optimized).",
          "Quantify impact (e.g., improved performance by 30%).",
          `Align content with target skills: ${skills.join(", ")}`,
        ],
        source: "mock",
      });
    }

    return res.json({
      suggestions: ["(AI) This is where real suggestions would appear."],
      source: "openai",
    });
  } catch (e) {
    res.status(500).json({ message: "AI suggestion failed", error: e.message });
  }
};

/* Main AI suggest endpoint */
exports.suggest = async (req, res) => {
  try {
    const { section, text, skills = [] } = req.body;
    if (!text)
      return res.status(400).json({ message: "Missing text in request body" });

    // If no API key then mock
    if (!OPENAI_KEY) {
      if (section === "project")
        return res.json({
          suggestions: mockImproveProject(text),
          source: "mock",
        });
      if (section === "summary")
        return res.json({
          suggestions: mockImproveSummary(text),
          source: "mock",
        });
      return res.json({
        suggestions: [
          "Use action verbs and quantify results.",
          "Lead with impact and technologies used.",
          `Include keywords: ${skills.slice(0, 6).join(", ")}`,
        ],
        source: "mock",
      });
    }

    // ensure fetch is available
    const fetchFn = getFetch();
    if (!fetchFn) {
      return res.status(500).json({
        message:
          "Server fetch not available. Upgrade Node to v18+ or install node-fetch.",
      });
    }

    // Real OpenAI path

    const messages = buildPrompt(section, text);
    const body = {
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 400,
      temperature: 0.6,
    };

    const resp = await fetchFn(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const textBody = await resp.text();
    if (!resp.ok) {
      let parsed;
      try {
        parsed = JSON.parse(textBody);
      } catch (_) {
        parsed = textBody;
      }
      console.error("OpenAI error:", resp.status, parsed);
      return res
        .status(502)
        .json({ message: "AI provider error", details: parsed });
    }

    let data;
    try {
      data = JSON.parse(textBody);
    } catch (err) {
      console.error("Failed to parse OpenAI JSON:", err, textBody);
      return res.status(502).json({ message: "Invalid AI response format" });
    }

    const output = (data?.choices?.[0]?.message?.content || "").trim();

    // Project section expects JSON
    if (section === "project") {
      const parsed = extractJSONFromText(output);
      if (parsed && (parsed.title || parsed.summary)) {
        return res.json({ suggestions: parsed, source: "openai" });
      }
      // heuristic fallback
      const heurTitle =
        (output.split("\n")[0] || "").slice(0, 80) || "Improved Project Title";
      const heurSummary =
        output.split("\n").slice(1).join(" ").trim() || output.slice(0, 300);
      return res.json({
        suggestions: { title: heurTitle, summary: heurSummary },
        source: "openai-heuristic",
      });
    }

    if (section === "summary") {
      const cleaned = output.replace(/\n/g, " ").trim();
      return res.json({ suggestions: cleaned, source: "openai" });
    }

    // General case
    return res.json({ suggestions: output, source: "openai" });
  } catch (err) {
    console.error("AI suggest error:", err);
    return res.status(500).json({
      message: "AI suggestion failed",
      error: err.message || err,
    });
  }
};
