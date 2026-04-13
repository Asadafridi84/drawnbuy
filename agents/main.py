"""
main.py
=======
DrawnBuy Agent Team — Entry Point

This is how you talk to your team from VS Code terminal.
Run it and type your request to the Team Leader.

Usage:
  python agents/main.py                    # Interactive mode
  python agents/main.py --task "..."       # One-shot mode
  python agents/main.py --agent frontend  # Run a specific agent
  python agents/main.py --security-scan   # Quick security scan
  python agents/main.py --affiliate-ideas # Get affiliate ideas
  python agents/main.py --weekly-review   # Full team weekly review
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# ── Environment setup ─────────────────────────────────────────────────────────
# Load .env.local first (Next.js convention), then .env
project_root = Path(__file__).resolve().parent.parent
for env_file in (".env.local", ".env"):
    env_path = project_root / env_file
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_file}")
        break

# Add project root to Python path
sys.path.insert(0, str(project_root))

from agents.crew import DrawnbuyCrew


# ── Banner ────────────────────────────────────────────────────────────────────

BANNER = """
╔══════════════════════════════════════════════════════════════╗
║           🎨  DrawnBuy Agent Team  🤖                        ║
║                                                              ║
║  Your AI development team for DrawnBuy                      ║
║                                                              ║
║  Team:                                                       ║
║   👑 Team Leader    — Orchestrates everything               ║
║   🎨 Frontend Agent — React/Next.js, UI/UX                  ║
║   ⚙️  Backend Agent  — API, DB, Infrastructure              ║
║   🔒 Security Agent — Threats, Audits, OWASP                ║
║   💰 Affiliate Agent — Programs, Revenue, Categories        ║
║                                                              ║
║  Powered by: Claude + CrewAI + Python                       ║
╚══════════════════════════════════════════════════════════════╝
"""

HELP_TEXT = """
📖 What can I ask the team?

FRONTEND EXAMPLES:
  "Improve the product card design on the homepage"
  "Add dark mode to the navigation"
  "Audit the mobile responsiveness of the category pages"
  "Add smooth scroll animations to the hero section"
  "Fix the product image loading performance"

BACKEND EXAMPLES:
  "Review the API routes for performance issues"
  "Add caching to the product listing endpoint"
  "Check why the /api/products route is slow"
  "Add proper error handling to all API routes"

SECURITY EXAMPLES:
  "Run a full security audit of DrawnBuy"
  "Check if there are any hardcoded secrets in the code"
  "Review the authentication setup"
  "Scan for XSS vulnerabilities"

AFFILIATE EXAMPLES:
  "Research affiliate programs for art supplies"
  "Find the best affiliate programs for digital design tools"
  "What new product categories should DrawnBuy add?"
  "Analyze the revenue potential of the photography equipment category"

TEAM TASKS:
  "Do a complete review of the DrawnBuy website"
  "Prepare a weekly status report"
  "The login page is broken — investigate and fix it"
  "How can we add a new agent to the team?"

Type 'help' for this menu, 'quit' to exit.
"""


# ── Main application ──────────────────────────────────────────────────────────

def check_api_key() -> bool:
    """Verify the Anthropic API key is set."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n❌ ANTHROPIC_API_KEY not found!")
        print("\nPlease add it to your .env.local file:")
        print("  ANTHROPIC_API_KEY=sk-ant-api-your-key-here")
        print("\nGet your API key at: https://console.anthropic.com")
        return False
    if not api_key.startswith("sk-ant"):
        print(f"\n⚠️  API key looks unusual (doesn't start with sk-ant)")
        print("  Make sure you copied the full key from console.anthropic.com")
    masked = api_key[:12] + "..." + api_key[-4:]
    print(f"✅ API Key: {masked}")
    return True


def run_interactive():
    """Run the agent team in interactive conversation mode."""
    print(BANNER)

    if not check_api_key():
        return

    crew = DrawnbuyCrew()
    print(HELP_TEXT)
    print("\n" + "─"*60)
    print("👑 Team Leader is ready. What do you need?")
    print("─"*60 + "\n")

    while True:
        try:
            user_input = input("You → ").strip()

            if not user_input:
                continue

            if user_input.lower() in ("quit", "exit", "q", "bye"):
                print("\n👋 DrawnBuy Agent Team signing off. See you next time!")
                break

            if user_input.lower() in ("help", "?", "h"):
                print(HELP_TEXT)
                continue

            if user_input.lower() == "weekly review":
                user_input = (
                    "Conduct a comprehensive weekly review of the DrawnBuy project. "
                    "Have each agent report on their domain: Frontend Agent reviews "
                    "UI health, Backend Agent checks API and infrastructure health, "
                    "Security Agent provides a security posture update, and Affiliate "
                    "Agent reports on affiliate opportunities. Compile into a weekly report."
                )

            print(f"\n⚡ Sending to Team Leader...\n")
            result = crew.run(user_input)

            print("\n" + "─"*60)
            print("📋 TEAM LEADER REPORT:")
            print("─"*60)
            print(result)
            print("─"*60 + "\n")

        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("Try again or type 'quit' to exit.\n")


def run_one_shot(task: str):
    """Run a single task and exit."""
    print(BANNER)
    if not check_api_key():
        return
    crew = DrawnbuyCrew()
    result = crew.run(task)
    print("\n📋 RESULT:")
    print("─"*60)
    print(result)


def run_single_agent(agent_type: str, task: str = None):
    """Run a specific specialist agent directly."""
    print(BANNER)
    if not check_api_key():
        return

    default_tasks = {
        "frontend": "Perform a comprehensive UI/UX audit of the DrawnBuy frontend. Check all components for performance, accessibility, and design quality issues.",
        "backend": "Perform a backend health check. Scan all API routes, check for missing error handling, review caching strategies, and audit dependencies.",
        "security": "Run a complete security audit. Scan for hardcoded secrets, XSS vulnerabilities, SQL injection risks, check security headers, and review authentication.",
        "affiliate": "Research and provide a comprehensive report on the top 5 affiliate category opportunities for DrawnBuy with revenue estimates.",
    }

    task = task or default_tasks.get(agent_type, f"Perform a thorough audit of your domain for the DrawnBuy project.")
    crew = DrawnbuyCrew()
    result = crew.run_quick_task(agent_type, task)
    print(f"\n📋 {agent_type.title()} Agent Report:")
    print("─"*60)
    print(result)


# ── CLI argument parsing ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="DrawnBuy Agent Team — Your AI development team",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agents/main.py
  python agents/main.py --task "Improve the homepage design"
  python agents/main.py --agent frontend
  python agents/main.py --agent security
  python agents/main.py --security-scan
  python agents/main.py --affiliate-ideas
        """
    )

    parser.add_argument(
        "--task", "-t",
        type=str,
        help="Run a one-shot task (e.g., \"Improve product card design\")"
    )
    parser.add_argument(
        "--agent", "-a",
        choices=["frontend", "backend", "security", "affiliate"],
        help="Run a specific specialist agent directly"
    )
    parser.add_argument(
        "--security-scan",
        action="store_true",
        help="Quick: run full security scan"
    )
    parser.add_argument(
        "--affiliate-ideas",
        action="store_true",
        help="Quick: get affiliate category ideas"
    )
    parser.add_argument(
        "--weekly-review",
        action="store_true",
        help="Run a full weekly team review"
    )
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Check that environment variables are properly configured"
    )

    args = parser.parse_args()

    # Handle flags
    if args.check_env:
        print(BANNER)
        if check_api_key():
            print("✅ Environment looks good! Run `python agents/main.py` to start.")
        return

    if args.security_scan:
        run_one_shot(
            "Run a complete security audit of DrawnBuy. Scan for hardcoded secrets, "
            "XSS vulnerabilities, SQL injection risks, missing security headers, and "
            "review the authentication setup. Provide a scored security report."
        )
        return

    if args.affiliate_ideas:
        run_single_agent(
            "affiliate",
            "Provide a comprehensive analysis of the top 10 affiliate category "
            "opportunities for DrawnBuy, with revenue projections and recommended "
            "affiliate programs to join immediately."
        )
        return

    if args.weekly_review:
        run_one_shot(
            "Conduct a full weekly review of DrawnBuy. Each specialist agent should "
            "audit their domain: Frontend (UI health, performance), Backend (API health, "
            "uptime), Security (threat scan, vulnerability update), Affiliate (new "
            "opportunities, revenue optimization). Compile into a weekly executive report."
        )
        return

    if args.task:
        run_one_shot(args.task)
        return

    if args.agent:
        run_single_agent(args.agent)
        return

    # Default: interactive mode
    run_interactive()


if __name__ == "__main__":
    main()
