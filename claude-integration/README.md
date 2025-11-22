# Claude Integration (local)

This small utility helps you collect a safe snapshot of your workspace and send it to Anthropic Claude for analysis. It is intended to be run locally — do not run this on a public server or expose your API key.

What it does

- `npm run collect` — walk the repo (excluding common folders like `node_modules` and `.git`) and write `claude-integration/files_snapshot.json`. It includes small file contents (up to 8 KB) and file sizes.
- `npm run send` — read the snapshot and send a compact JSON summary to Anthropic Claude using the official SDK. The script prints the model's response.

Security

- The snapshot may contain sensitive data. Review `files_snapshot.json` before sending.
- Never commit your API key. Use `.env` (copy from `.env.example`) or set `ANTHROPIC_API_KEY` in your environment.

Setup

1. From the workspace root run:

```powershell
cd claude-integration
npm install
```

2. Create `.env` from the example and set your key:

```powershell
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY
```

Usage

```powershell
# collect a snapshot
npm run collect

# send to Anthropic Claude (will read .env)
npm run send
```

Notes

- The included `sendToClaude.js` uses `@anthropic-ai/sdk`. If the SDK or API changes, adapt `sendToClaude.js` to use the appropriate endpoint and request format.
- The prompt is intentionally compact and includes only small excerpts of file contents to avoid hitting token limits.
