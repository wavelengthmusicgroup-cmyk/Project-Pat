# Project-Pat

A web project with social media integration capabilities, zero-dependency development server, and Claude AI integration.

## 🚀 Quick Start

\\\ash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Project-Pat.git
cd Project-Pat

# Install Python dependencies
pip install -r requirements.txt

# Start development server
npm start
# OR
node dev-server.js
\\\

Open browser to http://localhost:8080

## 📋 Prerequisites

- Node.js v24.11.1+
- Python 3.12.10+
- Git

## 🌐 Features

- **Zero-Dependency Dev Server** - Works without npm packages
- **Social Media Integration** - Guides for 15+ platforms (Facebook, Instagram, Twitter, etc.)
- **Claude AI Integration** - Analyze code using Anthropic Claude API
- **Python Backend** - Flask-ready environment

See \SETUP.md\ for detailed instructions and \social-media-integration.json\ for integration guides.

## 📤 Sharing This Project

**Option 1: Public Repository**
- Just share the GitHub URL with anyone

**Option 2: Private Repository**
- Go to Settings → Collaborators → Add people
- Enter their GitHub username or email

**Option 3: As Template**
- Others can click "Use this template" to create their own copy

## 🤖 Claude Integration

\\\ash
cd claude-integration
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
node collect-and-send.js
\\\

---

Made with ❤️ | See \SETUP.md\ for troubleshooting
