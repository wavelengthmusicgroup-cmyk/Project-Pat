#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");
const https = require("https");

// Simple .env loader (no dependencies needed)
try {
  const envPath = path.join(__dirname, ".env");
  const envFile = require("fs").readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
} catch (e) {
  // .env file not found or unreadable
}

const ROOT = path.resolve(__dirname, "..");
const MAX_FILE_BYTES = 8 * 1024;
const IGNORE = new Set([
  "node_modules",
  ".git",
  ".env",
  ".env.local",
  "claude-integration",
]);

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

if (!API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY in .env file");
  console.error("Copy .env.example to .env and set your API key");
  process.exit(1);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const ent of entries) {
    if (IGNORE.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, "/");
    if (ent.isDirectory()) {
      results.push(...(await walk(full)));
    } else if (ent.isFile()) {
      try {
        const stat = await fs.stat(full);
        let content = null;
        if (stat.size <= MAX_FILE_BYTES) {
          try {
            content = await fs.readFile(full, "utf8");
          } catch (e) {
            content = `<binary or unreadable: ${stat.size} bytes>`;
          }
        }
        results.push({ path: rel, size: stat.size, content });
      } catch (e) {
        // skip unreadable
      }
    }
  }
  return results;
}

function buildPrompt(files) {
  const fileList = files
    .map((f) => {
      const preview = f.content ? f.content.slice(0, 500) : `<${f.size} bytes>`;
      return `\n## ${f.path} (${f.size} bytes)\n${preview}`;
    })
    .join("\n");

  return `You are analyzing a web project. Here are the files:\n${fileList}\n\nPlease:\n1. Summarize the project structure\n2. List any missing dependencies or setup steps\n3. Provide Windows PowerShell commands to run the project`;
}

async function sendToClaude(prompt) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const options = {
    hostname: "api.anthropic.com",
    port: 443,
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, statusCode: res.statusCode });
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("📁 Collecting files from workspace...");
  const files = await walk(ROOT);
  console.log(`✅ Found ${files.length} files`);

  console.log("\n🔄 Sending to Claude...");
  const prompt = buildPrompt(files);

  try {
    const response = await sendToClaude(prompt);

    if (response.content && response.content[0]) {
      console.log("\n📝 Claude Response:\n");
      console.log(response.content[0].text);
    } else if (response.error) {
      console.error("\n❌ API Error:", response.error);
    } else {
      console.log("\n📄 Raw Response:", JSON.stringify(response, null, 2));
    }
  } catch (err) {
    console.error("\n❌ Network Error:", err.message);
    console.error("Check your internet connection and API key");
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
