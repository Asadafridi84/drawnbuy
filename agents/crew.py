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

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from langchain_anthropic import ChatAnthropic

# Import all tools
from agents.tools import (
    TEAM_LEADER_TOOLS,
    FRONTEND_TOOLS,
    BACKEND_TOOLS,
    SECURITY_TOOLS,
    AFFILIATE_TOOLS,
)


# ── LLM Configuration ─────────────────────────────────────────────────────────

def create_llm(model: str = "claude-sonnet-4-6", temperature: float = 0.1) -> ChatAnthropic:
    """
    Create an Anthropic Claude LLM instance.
    Uses claude-sonnet-4-6 by default for the best balance of quality and speed.
    Set temperature low (0.1) for consistent, focused agent outputs.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "❌ ANTHROPIC_API_KEY not found!\n"
            "Please add it to your .env.local file:\n"
            "ANTHROPIC_API_KEY=your-key-here"
        )
    return ChatAnthropic(
        model=model,
        anthropic_api_key=api_key,
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
            tools=TEAM_LEADER_TOOLS,
            llm=self.llm,
            allow_delegation=True,  # Can delegate to any agent
            verbose=True,
            max_iter=15,
            memory=True,
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
            memory=True,
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
            memory=True,
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
            memory=True,
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
            tools=AFFILIATE_TOOLS,
            llm=self.llm,
            allow_delegation=True,  # Can request UI/data changes from other agents
            verbose=True,
            max_iter=15,
            memory=True,
        )

    # ── Crew Assembly ─────────────────────────────────────────────────────────

    def assemble_crew(self, task_description: str) -> Crew:
        """
        Assemble the full DrawnBuy agent team as a CrewAI Crew.

        Uses HIERARCHICAL process:
        - Team Leader acts as manager
        - Team Leader reads the request and delegates to specialists
        - Specialists can communicate with each other via delegation
        - All results flow back to Team Leader for synthesis
        """
        team_leader = self.build_team_leader()
        frontend = self.build_frontend_agent()
        backend = self.build_backend_agent()
        security = self.build_security_agent()
        affiliate = self.build_affiliate_agent()

        # Create the main task for the Team Leader
        main_task = Task(
            description=(
                f"The DrawnBuy project owner has requested the following:\n\n"
                f"'{task_description}'\n\n"
                f"As Team Leader, analyze this request thoroughly and:\n"
                f"1. Break it down into specific sub-tasks for the appropriate specialist agents\n"
                f"2. Delegate each sub-task to the right specialist\n"
                f"3. Ensure agents share relevant information with each other as needed\n"
                f"4. After all specialists complete their work, compile a clear summary\n"
                f"5. Flag any security concerns to the Security Agent\n"
                f"6. Save the full operation report to /agents/reports/team_leader/\n\n"
                f"Available specialists you can delegate to:\n"
                f"- Frontend Agent: React/Next.js, UI/UX, performance, accessibility\n"
                f"- Backend Agent: APIs, database, infrastructure, uptime\n"
                f"- Security Agent: vulnerabilities, auditing, compliance, hardening\n"
                f"- Affiliate Agent: affiliate programs, category research, revenue optimization"
            ),
            expected_output=(
                "A comprehensive executive summary including:\n"
                "- What each agent did and key decisions made\n"
                "- Any code changes or files modified\n"
                "- Security clearance status\n"
                "- Outstanding items or next recommended actions\n"
                "- Inter-agent communications that occurred\n"
                "Formatted as clean Markdown and saved to reports/team_leader/"
            ),
            agent=team_leader,
        )

        return Crew(
            agents=[team_leader, frontend, backend, security, affiliate],
            tasks=[main_task],
            process=Process.hierarchical,
            manager_agent=team_leader,
            verbose=True,
            memory=False,        # Set True only if VOYAGE_API_KEY is configured
            max_rpm=10,          # Rate limit: 10 requests per minute
            share_crew=False,    # Keep DrawnBuy data private
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
