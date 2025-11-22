# Project Setup Guide

## Problem Solved

Your environment had Node.js installed but:

1. PowerShell PATH wasn't refreshed (fixed)
2. npm couldn't reach registry due to network/firewall (workaround created)

## ✅ What's Ready

### 1. Development Server (Zero Dependencies)

- **File**: `dev-server.js`
- **No npm packages needed** — uses only Node.js built-ins
- Serves static files (HTML, CSS, JS) on http://localhost:8080

### 2. Claude Integration (Zero Dependencies)

- **File**: `claude-integration/collect-and-send.js`
- **No npm packages needed** — pure Node.js + HTTPS
- Collects workspace files and sends to Anthropic Claude API

---

## 🚀 Quick Start

### Run Your Project

```powershell
# Start the dev server
npm start

# OR directly with node
node dev-server.js
```

Open browser: http://localhost:8080

---

## 🤖 Claude Integration Setup

### Step 1: Get API Key

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new key and copy it

### Step 2: Configure

```powershell
cd claude-integration

# Copy example env file
copy .env.example .env

# Edit .env and paste your key:
notepad .env
```

In `.env`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### Step 3: Run

```powershell
# From claude-integration folder
node collect-and-send.js

# OR from project root
node claude-integration/collect-and-send.js
```

---

## 🔧 Troubleshooting

### PowerShell doesn't see Node

If you get "node: The term 'node' is not recognized":

```powershell
# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify
node -v
npm -v
```

### npm install still fails

**Don't worry!** Everything works without `npm install`:

- `dev-server.js` has zero dependencies
- `collect-and-send.js` has zero dependencies
- You don't need `node_modules/` to run the project

If you fix your network later and want to try `live-server`:

```powershell
# Check firewall/antivirus
# Disable VPN temporarily
# Then:
npm install --verbose
```

### Claude integration fails

1. Check `.env` file exists in `claude-integration/` folder
2. Verify API key is correct (starts with `sk-ant-`)
3. Test internet: `Test-NetConnection api.anthropic.com -Port 443`
4. Check firewall isn't blocking Node.js

---

## 📁 Project Structure

```
Project-Pat/
├── index.html              # Main HTML file
├── style.css               # Styles
├── script.js               # Client-side JS
├── main.py                 # Python script (if any)
├── dev-server.js           # ✨ Zero-dependency dev server
├── package.json            # npm configuration
├── .gitignore              # Git ignore rules
├── SETUP.md                # This file
└── claude-integration/
    ├── collect-and-send.js # ✨ All-in-one Claude tool
    ├── collectFiles.js     # (legacy - needs npm)
    ├── sendToClaude.js     # (legacy - needs npm)
    ├── .env.example        # Environment template
    ├── .env                # Your API key (create this)
    ├── package.json        # (optional - not needed)
    └── README.md           # Detailed docs
```

---

## 🎯 Next Steps

1. **Test your web project**:

   ```powershell
   node dev-server.js
   # Open http://localhost:8080
   ```

2. **Get Claude to analyze your code**:

   - Set up `.env` with your Anthropic API key
   - Run `node claude-integration/collect-and-send.js`
   - Claude will tell you what's missing and how to fix it

3. **Fix npm network issues** (optional):
   - Check Windows Firewall
   - Check antivirus (some block npm)
   - Try different network
   - Contact IT if corporate network

---

## 🔐 Security Notes

- **Never commit `.env`** — it contains your API key
- `.gitignore` already excludes it
- Review collected files before sending to Claude
- API calls cost money — monitor your Anthropic usage

---

## ✨ Summary

**Problem**: Couldn't run `npm install` due to network issues  
**Solution**: Created zero-dependency alternatives that work with just Node.js

Everything now works without needing npm packages! 🎉
