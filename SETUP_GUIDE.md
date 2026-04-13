# 🚀 DrawnBuy Agent Team — VS Code Setup Guide

Your complete AI development team is ready. Follow these steps to get it running inside your drawnbuy project in VS Code.

---

## What You're Getting

```
5 AI agents powered by Claude + CrewAI:

You ──→ 👑 Team Leader
              ├──→ 🎨 Frontend Agent   (React/Next.js, UI/UX, animations)
              ├──→ ⚙️  Backend Agent    (API, database, infrastructure)
              ├──→ 🔒 Security Agent   (OWASP, secrets scan, auditing)
              └──→ 💰 Affiliate Agent  (programs, categories, revenue)

All agents can talk to each other. All report to Team Leader.
You only ever talk to the Team Leader.
```

---

## Step 1 — Copy the agents/ folder into your project

Copy the entire `agents/` folder into your **drawnbuy project root**. Your project should look like:

```
drawnbuy/                    ← your existing project root
├── agents/                  ← 📁 COPY THIS FOLDER HERE
│   ├── config/
│   │   ├── agents.yaml
│   │   └── tasks.yaml
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── shared_tools.py
│   │   ├── frontend_tools.py
│   │   ├── backend_tools.py
│   │   ├── security_tools.py
│   │   └── affiliate_tools.py
│   ├── reports/             ← agents save their work here
│   │   ├── frontend/
│   │   ├── backend/
│   │   ├── security/
│   │   ├── affiliate/
│   │   └── team_leader/
│   ├── memory/              ← agent memory/messages
│   ├── __init__.py
│   ├── crew.py
│   ├── main.py
│   └── requirements.txt
├── app/                     ← your Next.js app
├── components/              ← your components
├── .env.local               ← add ANTHROPIC_API_KEY here
└── package.json
```

---

## Step 2 — Add your Anthropic API Key

Open your `.env.local` file (in the project root) and add:

```bash
ANTHROPIC_API_KEY=sk-ant-api-your-key-here
```

> Get your key at: **https://console.anthropic.com** → API Keys → Create Key

**IMPORTANT:** Make sure `.env.local` is in your `.gitignore` (it should be by default in Next.js projects).

---

## Step 3 — Install Python dependencies

Open the VS Code **Terminal** (`Ctrl + `` ` ``) and run:

```bash
# Make sure you're in your drawnbuy project root
cd your-drawnbuy-folder

# Install the Python packages
pip install -r agents/requirements.txt
```

> **Python 3.10 or higher required.**
> Check your version: `python --version`
> If you don't have Python: https://www.python.org/downloads/

---

## Step 4 — Verify the setup

```bash
python agents/main.py --check-env
```

You should see:
```
✅ Loaded environment from .env.local
✅ API Key: sk-ant-api...here
✅ Environment looks good!
```

---

## Step 5 — Start talking to your team!

```bash
python agents/main.py
```

The interactive console will open. Type your request:

```
You → Improve the product card design on the homepage
```

The Team Leader will analyze your request, delegate to the Frontend Agent, and report back.

---

## Quick Commands

```bash
# Interactive mode (recommended)
python agents/main.py

# One-shot task
python agents/main.py --task "Run a security audit"

# Run specific agent directly
python agents/main.py --agent frontend
python agents/main.py --agent backend
python agents/main.py --agent security
python agents/main.py --agent affiliate

# Quick security scan
python agents/main.py --security-scan

# Get affiliate category ideas
python agents/main.py --affiliate-ideas

# Full weekly review
python agents/main.py --weekly-review
```

---

## Example Requests to Try First

### Frontend
```
Audit the homepage for UI/UX improvements
Add smooth scroll animations to the product section
Check the mobile responsiveness of the category pages
```

### Backend
```
Review all API routes for missing error handling
Check if there are any performance bottlenecks in the backend
```

### Security
```
Run a full security audit of DrawnBuy
Scan the codebase for any hardcoded API keys or secrets
Check if our security headers are properly configured
```

### Affiliate
```
Research affiliate programs for art supplies category
What new categories should DrawnBuy add?
Find the best affiliate programs for digital design tools
```

### Full Team
```
Do a complete health check of the entire DrawnBuy project
Prepare the weekly status report
```

---

## Where Agents Save Their Work

All agent reports are saved in `agents/reports/`:

```
agents/reports/
├── team_leader/    ← Operation summaries, weekly reviews
├── frontend/       ← UI audits, component reports
├── backend/        ← API reports, health checks
├── security/       ← Security audits, vulnerability reports
└── affiliate/      ← Research reports, revenue analysis
```

Open any `.md` file in VS Code with **Ctrl+Shift+V** to preview it.

---

## How Agents Communicate

The agents communicate with each other automatically:
- Team Leader delegates tasks to specialists
- Frontend Agent can ask Backend Agent for API contracts
- Security Agent reviews changes from all agents
- Affiliate Agent requests UI changes from Frontend Agent

You can also see inter-agent messages in `agents/memory/agent_messages.json`.

---

## Adding a New Agent in the Future

When you need a new specialist (e.g., an SEO Agent or Analytics Agent), ask the Team Leader:

```
You → How do I add an SEO Agent to the team?
```

The Team Leader will generate a complete onboarding guide with:
- YAML config to add to `agents.yaml`
- Tools/superpowers the new agent needs
- Code snippet to add to `crew.py`
- Communication protocols with existing agents

---

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**
→ Make sure `.env.local` is in your project ROOT (same level as `package.json`)
→ Make sure the key starts with `sk-ant-api`

**"ModuleNotFoundError: No module named 'crewai'"**
→ Run: `pip install -r agents/requirements.txt`

**"Rate limit exceeded"**
→ Wait 1 minute and try again. The system will auto-retry.

**Agents seem stuck / no output**
→ Press `Ctrl+C` to interrupt, then try again with a simpler request first.

**"No such file or directory: next.config.js"**
→ Make sure you copied the `agents/` folder into your drawnbuy project ROOT
   (the same folder that contains `package.json` and `next.config.js`)

---

## VS Code Recommended Extensions

Install these for the best experience working alongside your agents:

- **Python** (ms-python.python) — Python language support
- **Pylance** (ms-python.vscode-pylance) — Python IntelliSense
- **Markdown Preview Enhanced** — to preview agent reports
- **GitLens** — to track what agents changed

---

*DrawnBuy Agent Team v1.0 — Built with CrewAI + Anthropic Claude*
