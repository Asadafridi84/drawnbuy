"""
crew.py
=======
DrawnBuy Agent Team — Main Crew Orchestration

This is the heart of the agent system. It wires together:
  - 5 specialist agents (Team Leader, Frontend, Backend, Security, Affiliate)
  - CrewAI hierarchical process (Team Leader directs the others)
  - All superpowers (tools) for each agent
  - Full error handling, memory, and retry logic
  - Inter-agent communication via delegation

Architecture:
  You → Team Leader → [Frontend | Backend | Security | Affiliate]
                            ↕           ↕          ↕          ↕
                         (agents communicate directly with each other)

Usage:
  from agents.crew import DrawnbuyCrew
  crew = DrawnbuyCrew()
  result = crew.run("Improve the homepage product card design")
"""

import os
import sys
import time
import traceback
from pathlib import Path
from datetime import datetime
from typing import Optional

from crewai import Agent, Crew, LLM, Process, Task
from crewai.project import CrewBase, agent, crew, task

# Import all tools
from agents.tools import (
    TEAM_LEADER_TOOLS,
    FRONTEND_TOOLS,
    BACKEND_TOOLS,
    SECURITY_TOOLS,
    AFFILIATE_TOOLS,
)


# ── LLM Configuration ─────────────────────────────────────────────────────────

def create_llm(model: str = "claude-sonnet-4-6", temperature: float = 0.1) -> LLM:
    """
    Create a CrewAI LLM instance backed by Anthropic Claude.
    Uses claude-sonnet-4-6 by default for the best balance of quality and speed.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY not found!\n"
            "Please add it to your .env.local file:\n"
            "ANTHROPIC_API_KEY=your-key-here"
        )
    return LLM(
        model=f"anthropic/{model}",
        api_key=api_key,
        temperature=temperature,
        max_tokens=8096,
    )


# ── DrawnBuy Crew ─────────────────────────────────────────────────────────────

class DrawnbuyCrew:
    """
    The DrawnBuy Agent Team.

    Capabilities:
    ✅ Long-horizon project management
    ✅ Complex workflow orchestration
    ✅ Better quality via specialist agents
    ✅ Automatic task orchestration
    ✅ Intelligent coordination (hierarchical process)
    ✅ Built-in specialization (each agent owns their domain)
    ✅ Error handling with retries and fallbacks
    """

    def __init__(self):
        self.llm = create_llm()
        self._agents = None
        self._crew = None

    # ── Agent Definitions ────────────────────────────────────────────────────

    def build_team_leader(self) -> Agent:
        """
        The Team Leader — your direct point of contact.
        Orchestrates all other agents, has full project visibility,
        knows how to add new agents to the team.
        """
        return Agent(
            role="DrawnBuy Project Manager & Lead Architect",
            goal=(
                "Orchestrate the DrawnBuy development team. Coordinate the Frontend, "
                "Backend, Security, and Affiliate agents. Break down complex requests "
                "into executable tasks, delegate to specialists, synthesize results, "
                "and maintain the strategic roadmap. Guide the owner on how to expand "
                "the team with new agents when needed."
            ),
            backstory=(
                "You are an elite technical project manager with 15+ years of experience "
                "leading cross-functional engineering teams. You have deep working knowledge "
                "of React/Next.js architectures, Node.js backends, cybersecurity fundamentals, "
                "and affiliate marketing strategy. You are the single point of contact for the "
                "DrawnBuy owner. You always produce clean summary reports, saved to "
                "/agents/reports/team_leader/. You know exactly which agent to delegate to "
                "and when — and when a new capability is needed, you provide a complete "
                "onboarding guide for adding a new agent to the team."
            ),
            tools=[],           # Manager agent must have no tools in crewai 1.x hierarchical mode
            llm=self.llm,
            allow_delegation=True,
            verbose=True,
            max_iter=15,
            memory=False,
        )

    def build_frontend_agent(self) -> Agent:
        """
        The Frontend Agent — React/Next.js specialist.
        Owns all UI, UX, animations, performance, and accessibility.
        """
        return Agent(
            role="Senior Frontend Developer & UI/UX Specialist",
            goal=(
                "Build, maintain, and continuously improve DrawnBuy's React/Next.js "
                "frontend with pixel-perfect UI, smooth animations, excellent Core Web "
                "Vitals scores, and outstanding UX across all devices. Own /frontend, "
                "/components, /pages, /styles, /public, and /app directories."
            ),
            backstory=(
                "You are a world-class frontend engineer specializing in React 18, Vite, "
                "plain JSX (no TypeScript), CSS Modules, and modern web performance. "
                "DrawnBuy uses Vite — NOT Next.js. No App Router, no Tailwind, no TypeScript. "
                "Styles are CSS Modules (.module.css). Brand tokens: purple #7c3aed, gold #fbbf24, "
                "cyan #67e8f9, bg #f4f0ff, dark #1e1b4b. Font: Space Grotesk. "
                "You specialize in affiliate platform UIs — product cards, category navigation, "
                "search, and conversion-optimized layouts. You keep Lighthouse scores above 90 "
                "and always ensure WCAG 2.1 AA accessibility. You communicate clearly with the "
                "Backend Agent on API contracts and consult the Security Agent on XSS/CSP. "
                "You document all work in /agents/reports/frontend/."
            ),
            tools=FRONTEND_TOOLS,
            llm=self.llm,
            allow_delegation=True,  # Can ask Backend/Security for info
            verbose=True,
            max_iter=15,
            memory=False,
        )

    def build_backend_agent(self) -> Agent:
        """
        The Backend Agent — API, database, and infrastructure specialist.
        Ensures 99.9% uptime and easy extensibility.
        """
        return Agent(
            role="Senior Backend Engineer & Infrastructure Specialist",
            goal=(
                "Maintain an ultra-reliable, scalable, and easy-to-extend backend for "
                "DrawnBuy. Achieve 99.9% uptime, handle traffic spikes gracefully, and "
                "make it trivially easy to add new features without breaking existing "
                "functionality. Own /backend, /api, /lib, /db, /prisma, /server directories."
            ),
            backstory=(
                "You are a veteran backend engineer with deep expertise in Node.js, "
                "API design (REST/GraphQL), database optimization (PostgreSQL/MongoDB/Redis), "
                "serverless architectures, and CI/CD pipelines. You follow SOLID principles, "
                "implement circuit breakers and graceful degradation, and always design for "
                "scalability. You never make breaking changes without a migration plan. You "
                "collaborate with Frontend on API contracts and Security on hardening. "
                "You document all changes in /agents/reports/backend/."
            ),
            tools=BACKEND_TOOLS,
            llm=self.llm,
            allow_delegation=True,  # Can ask Frontend/Security for info
            verbose=True,
            max_iter=15,
            memory=False,
        )

    def build_security_agent(self) -> Agent:
        """
        The Security Agent — cybersecurity expert and threat analyst.
        Keeps DrawnBuy protected from all threats.
        """
        return Agent(
            role="Cybersecurity Expert & Threat Intelligence Analyst",
            goal=(
                "Keep DrawnBuy fully protected from all cyber threats, vulnerabilities, "
                "and attacks — from OWASP Top 10 to affiliate fraud detection. Proactively "
                "scan, audit, and harden all parts of the codebase. Ensure the platform "
                "is secure, compliant (GDPR/CCPA), and resilient against attacks."
            ),
            backstory=(
                "You are a certified cybersecurity professional with deep expertise in "
                "web application security, OWASP Top 10 mitigation, penetration testing, "
                "secure code review, and threat modeling. You specialize in click fraud "
                "detection, affiliate link integrity, data privacy compliance, DDoS protection, "
                "and CVE scanning. You proactively audit code changes from other agents, "
                "enforce security headers, and provide clear remediation steps. You never "
                "leave a vulnerability unaddressed. All findings go to /agents/reports/security/."
            ),
            tools=SECURITY_TOOLS,
            llm=self.llm,
            allow_delegation=True,  # Can ask Frontend/Backend to fix issues
            verbose=True,
            max_iter=15,
            memory=False,
        )

    def build_affiliate_agent(self) -> Agent:
        """
        The Affiliate Agent — affiliate marketing research specialist.
        Finds the best programs and categories for DrawnBuy.
        """
        return Agent(
            role="Affiliate Marketing Research & Intelligence Specialist",
            goal=(
                "Continuously research, discover, and evaluate the best affiliate companies "
                "and products for every category on DrawnBuy. Provide actionable intelligence "
                "to maximize affiliate revenue and add genuine value for visitors. Recommend "
                "new product categories and partnership strategies."
            ),
            backstory=(
                "You are an affiliate marketing expert with encyclopedic knowledge of major "
                "networks — Amazon Associates, ShareASale, CJ Affiliate, Impact, Awin, Rakuten, "
                "ClickBank. You specialize in category analysis, commission rate comparison, "
                "EPC benchmarks, and identifying high-converting partnerships for design/creative "
                "audiences. You communicate with Frontend when new category UI is needed and "
                "Backend when new affiliate data needs storage. You document research in "
                "/agents/reports/affiliate/."
            ),
        )

    # ── Crew Assembly ─────────────────────────────────────────────────────────

    def assemble_crew(self, task_description: str) -> Crew:
        """
        Assemble the full DrawnBuy agent team as a CrewAI Crew.

        Uses SEQUENTIAL process for reliability with Anthropic models:
        - Security agent audits the project
        - Frontend agent reviews UI/UX
        - Backend agent reviews APIs and infrastructure
        - Team Leader synthesizes all findings into a final report
        """
        team_leader = self.build_team_leader()
        frontend = self.build_frontend_agent()
        backend = self.build_backend_agent()
        security = self.build_security_agent()
        affiliate = self.build_affiliate_agent()

        security_task = Task(
            description=(
                f"The DrawnBuy owner has requested: '{task_description}'\n\n"
                f"As Security Agent, perform your part: scan the codebase for "
                f"hardcoded secrets, XSS vulnerabilities, missing security headers, "
                f"authentication issues, and any OWASP Top 10 risks. "
                f"Use your tools to read project files. Save your report."
            ),
            expected_output="A security findings report with severity ratings (Critical/High/Medium/Low) and remediation steps.",
            agent=security,
        )

        frontend_task = Task(
            description=(
                f"The DrawnBuy owner has requested: '{task_description}'\n\n"
                f"As Frontend Agent, perform your part: audit the Vite+React components "
                f"for UI/UX issues, performance problems, accessibility gaps, and "
                f"mobile responsiveness. Use your tools to read the components. Save your report."
            ),
            expected_output="A frontend audit report with prioritised findings and recommended fixes.",
            agent=frontend,
        )

        backend_task = Task(
            description=(
                f"The DrawnBuy owner has requested: '{task_description}'\n\n"
                f"As Backend Agent, perform your part: review the Express/Node.js server "
                f"for API health, error handling, dependencies, and environment variable "
                f"management. Use your tools to read server files. Save your report."
            ),
            expected_output="A backend health report with findings and recommendations.",
            agent=backend,
        )

        summary_task = Task(
            description=(
                f"The DrawnBuy owner has requested: '{task_description}'\n\n"
                f"As Team Leader, read the latest reports from the Security, Frontend, "
                f"and Backend agents. Compile everything into one clear executive summary "
                f"with: overall project health score, top 5 action items ranked by priority, "
                f"and next recommended steps. Save the summary report."
            ),
            expected_output=(
                "A clean Markdown executive summary with overall health score, "
                "top action items by priority, and next steps."
            ),
            agent=team_leader,
        )

        return Crew(
            agents=[security, frontend, backend, team_leader],
            tasks=[security_task, frontend_task, backend_task, summary_task],
            process=Process.sequential,
            verbose=True,
            memory=False,
            memory_config={"provider": "anthropic", "config": {"model": "claude-3-haiku-20240307"}},
            max_rpm=10,
            share_crew=False,
        )

    # ── Main Run Interface ────────────────────────────────────────────────────

    def run(self, request: str, max_retries: int = 3) -> str:
        """
        Run the DrawnBuy agent team on a request.

        ✅ Long-horizon: agents work through multi-step tasks
        ✅ Complex workflows: hierarchical delegation and coordination
        ✅ Error handling: retries with exponential backoff

        Args:
            request: Your request to the team (e.g., "Improve the product page UI")
            max_retries: Number of retries on failure (default: 3)

        Returns:
            The team's final report as a string
        """
        print(f"\n{'='*60}")
        print(f"🚀 DrawnBuy Agent Team Starting")
        print(f"📋 Request: {request}")
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                print(f"Attempt {attempt}/{max_retries}...")
                crew = self.assemble_crew(request)
                result = crew.kickoff()

                print(f"\n{'='*60}")
                print(f"✅ Mission Complete!")
                print(f"{'='*60}")
                return str(result)

            except KeyboardInterrupt:
                print("\n⚠️  Operation cancelled by user.")
                return "Operation cancelled."

            except Exception as e:
                last_error = e
                error_msg = str(e)
                print(f"\n⚠️  Attempt {attempt} failed: {error_msg}")

                # Don't retry on auth errors
                if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
                    print("❌ Authentication error — check your ANTHROPIC_API_KEY in .env.local")
                    return f"Authentication error: {error_msg}"

                # Don't retry on rate limit without waiting
                if "rate_limit" in error_msg.lower() or "rate limit" in error_msg.lower():
                    wait_time = 60
                    print(f"⏳ Rate limited — waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                elif attempt < max_retries:
                    wait_time = 2 ** attempt  # Exponential backoff: 2, 4, 8 seconds
                    print(f"⏳ Retrying in {wait_time}s...")
                    time.sleep(wait_time)

        # All retries failed
        error_report = self._create_error_report(request, last_error)
        print(f"\n❌ All {max_retries} attempts failed. Error report saved.")
        return error_report

    def run_quick_task(self, agent_type: str, task_description: str) -> str:
        """
        Run a single specialist agent directly (without full team orchestration).
        Useful for quick, focused tasks.

        agent_type: 'frontend', 'backend', 'security', or 'affiliate'
        task_description: what you want the agent to do

        Returns the agent's output.
        """
        agent_map = {
            "frontend": self.build_frontend_agent,
            "backend": self.build_backend_agent,
            "security": self.build_security_agent,
            "affiliate": self.build_affiliate_agent,
        }

        if agent_type not in agent_map:
            return f"Unknown agent type: {agent_type}. Use: {', '.join(agent_map.keys())}"

        agent = agent_map[agent_type]()
        task = Task(
            description=task_description,
            expected_output="A detailed report of findings and actions taken.",
            agent=agent,
        )

        try:
            crew = Crew(
                agents=[agent],
                tasks=[task],
                process=Process.sequential,
                verbose=True,
            )
            result = crew.kickoff()
            return str(result)
        except Exception as e:
            return f"Error running {agent_type} agent: {e}"

    # ── Error handling ────────────────────────────────────────────────────────

    def _create_error_report(self, request: str, error: Exception) -> str:
        """Create a structured error report when all retries fail."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        report = f"""# ❌ DrawnBuy Agent Error Report

**Timestamp:** {timestamp}
**Request:** {request}
**Error:** {str(error)}

## What to do

1. **Check your API key**: Make sure ANTHROPIC_API_KEY is set in .env.local
2. **Check internet connection**: Agents need internet access
3. **Check rate limits**: You may need to wait a minute and try again
4. **Simplify the request**: Break it into smaller steps

## Error Details
```
{traceback.format_exc()}
```

## Try again with:
```
python agents/main.py
```
"""
        # Try to save the error report
        try:
            reports_dir = Path(__file__).parent / "reports" / "team_leader"
            reports_dir.mkdir(parents=True, exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            (reports_dir / f"error_{ts}.md").write_text(report)
        except Exception:
            pass

        return report


