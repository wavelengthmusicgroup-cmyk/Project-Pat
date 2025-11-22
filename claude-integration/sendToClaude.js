require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const https = require("https");

// Try to load the official Anthropic SDK if available; otherwise we'll fall back to HTTPS
let Anthropic = null;
try {
  // eslint-disable-next-line global-require
  Anthropic = require("@anthropic-ai/sdk").Anthropic;
} catch (e) {
  Anthropic = null;
}

const SNAP = path.join(__dirname, "files_snapshot.json");
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-2.1";

if (!API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in environment. See .env.example");
  process.exit(1);
}

async function loadSnapshot() {
  try {
    const txt = await fs.readFile(SNAP, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    console.error("Snapshot not found. Run `npm run collect` first.");
    process.exit(1);
  }
}

function buildPrompt(snapshot) {
  // Build a compact prompt — filenames + short content previews
  const lines = [];
  lines.push("You are given a JSON array of files in a repository.");
  lines.push(
    "Please summarize the repository structure, list Node-related files (package.json, package-lock.json, node_modules, scripts), and point out any files that look like they require setup (e.g., missing dependencies, start scripts)."
  );
  lines.push(
    "Provide next-step commands to install Node dependencies and launch the project on Windows (PowerShell)."
  );
  lines.push("\n--- JSON FILES BEGIN ---\n");
  // To avoid extremely long prompts, only include path and a short excerpt of content
  const items = snapshot.files.map((f) => {
    const excerpt = f.content
      ? f.content.slice(0, 1000).replace(/\n/g, "\\n")
      : f.size > 0
      ? `<${f.size} bytes - skipped content>`
      : "";
    return { path: f.path, size: f.size, excerpt };
  });
  lines.push(JSON.stringify(items, null, 2));
  lines.push("\n--- JSON FILES END ---\n");
  return lines.join("\n");
}

async function sendToClaude(prompt) {
  if (Anthropic) {
    const client = new Anthropic({ apiKey: API_KEY });
    const resp = await client.complete({
      model: MODEL,
      prompt: prompt,
      max_tokens_to_sample: 1500,
      temperature: 0.0,
    });
    return resp;
  }

  // Fallback: direct HTTPS request to Anthropic API
  const body = JSON.stringify({
    model: MODEL,
    prompt: prompt,
    max_tokens_to_sample: 1500,
    temperature: 0.0,
  });

  const options = {
    hostname: "api.anthropic.com",
    port: 443,
    path: "/v1/complete",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          // If response isn't JSON, resolve raw text
          resolve({ text: data, statusCode: res.statusCode });
        }
      });
    });
    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
}

async function main() {
  const snap = await loadSnapshot();
  const prompt = buildPrompt(snap);
  console.log(
    "Sending prompt to Anthropic (truncated preview):\n",
    prompt.slice(0, 2000),
    "\n---"
  );
  const res = await sendToClaude(prompt);
  console.log("Response:");
  console.log(res?.completion || res?.data || res);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
