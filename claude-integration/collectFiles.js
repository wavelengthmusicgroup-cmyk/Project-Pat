const fs = require("fs").promises;
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "files_snapshot.json");
const MAX_FILE_BYTES = 8 * 1024; // 8 KB per-file content limit
const IGNORE = new Set(["node_modules", ".git", ".env", ".env.local"]);

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
        const isBinary = false; // naive: we won't attempt to detect — skip large files
        let content = null;
        if (stat.size <= MAX_FILE_BYTES) {
          try {
            content = await fs.readFile(full, "utf8");
          } catch (e) {
            content = null;
          }
        }
        results.push({ path: rel, size: stat.size, content: content });
      } catch (e) {
        // ignore unreadable files
      }
    }
  }
  return results;
}

async function main() {
  const files = await walk(ROOT);
  await fs.writeFile(
    OUT,
    JSON.stringify(
      { root: ROOT, generatedAt: new Date().toISOString(), files },
      null,
      2
    ),
    "utf8"
  );
  console.log(
    `Wrote ${OUT} with ${files.length} files (content limited to ${MAX_FILE_BYTES} bytes per file).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
