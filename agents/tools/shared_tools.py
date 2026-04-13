"""
shared_tools.py
===============
Superpowers shared by ALL DrawnBuy agents.
These tools allow agents to read/write their report files,
communicate with each other via the shared message system,
and read the project structure.
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from crewai.tools import tool

# ── Project root detection ────────────────────────────────────────────────────
def get_project_root() -> Path:
    """Walk up from this file to find the drawnbuy project root."""
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "package.json").exists() or (parent / "next.config.js").exists():
            return parent
    return current.parent.parent.parent  # fallback: 3 levels up from tools/


PROJECT_ROOT = get_project_root()
AGENTS_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = AGENTS_DIR / "reports"
MEMORY_DIR = AGENTS_DIR / "memory"
MESSAGES_FILE = MEMORY_DIR / "agent_messages.json"

# Ensure directories exist
MEMORY_DIR.mkdir(parents=True, exist_ok=True)


# ── File reading & writing ────────────────────────────────────────────────────

@tool("Read Project File")
def read_project_file(file_path: str) -> str:
    """
    Read any file in the DrawnBuy project.
    Provide a path relative to the project root (e.g., 'components/Header.tsx')
    or an absolute path.
    Returns the file contents as a string.
    """
    try:
        path = Path(file_path) if Path(file_path).is_absolute() else PROJECT_ROOT / file_path
        if not path.exists():
            return f"ERROR: File not found: {path}"
        if path.stat().st_size > 500_000:  # 500KB limit
            return f"ERROR: File too large (>{500}KB). Read specific sections instead."
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return f"ERROR reading file: {e}"


@tool("Write Project File")
def write_project_file(file_path: str, content: str) -> str:
    """
    Write or update a file in the DrawnBuy project.
    Provide file_path relative to project root (e.g., 'components/Header.tsx').
    The content parameter is the full new content of the file.
    Returns a success or error message.
    """
    try:
        path = Path(file_path) if Path(file_path).is_absolute() else PROJECT_ROOT / file_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return f"SUCCESS: File written to {path}"
    except Exception as e:
        return f"ERROR writing file: {e}"


@tool("List Project Directory")
def list_directory(directory: str = "") -> str:
    """
    List files and folders in a project directory.
    Provide a path relative to the project root (e.g., 'components') or
    leave empty to list the project root.
    Returns a formatted directory tree (2 levels deep).
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        if not target.exists():
            return f"ERROR: Directory not found: {target}"

        lines = [f"📁 {target.name}/"]
        try:
            entries = sorted(target.iterdir(), key=lambda e: (e.is_file(), e.name))
            for entry in entries:
                if entry.name.startswith(".") or entry.name in ("node_modules", "__pycache__", ".next", "dist"):
                    continue
                if entry.is_dir():
                    lines.append(f"  📁 {entry.name}/")
                    try:
                        sub = sorted(entry.iterdir(), key=lambda e: (e.is_file(), e.name))
                        for s in sub[:10]:  # max 10 sub-entries
                            if not s.name.startswith("."):
                                icon = "📄" if s.is_file() else "📁"
                                suffix = "/" if s.is_dir() else ""
                                lines.append(f"    {icon} {s.name}{suffix}")
                    except PermissionError:
                        pass
                else:
                    lines.append(f"  📄 {entry.name}")
        except PermissionError:
            return f"ERROR: Permission denied reading {target}"

        return "\n".join(lines)
    except Exception as e:
        return f"ERROR listing directory: {e}"


# ── Report writing ────────────────────────────────────────────────────────────

@tool("Save Agent Report")
def save_report(agent_name: str, report_title: str, content: str) -> str:
    """
    Save an agent's work report to the reports directory.
    agent_name: one of 'team_leader', 'frontend', 'backend', 'security', 'affiliate'
    report_title: short title for the report file (no spaces, use underscores)
    content: the full report content in Markdown format

    Reports are saved to /agents/reports/{agent_name}/{report_title}_{timestamp}.md
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_dir = REPORTS_DIR / agent_name
        report_dir.mkdir(parents=True, exist_ok=True)

        safe_title = report_title.replace(" ", "_").lower()
        filename = f"{safe_title}_{timestamp}.md"
        filepath = report_dir / filename

        header = f"# {report_title}\n\n**Agent:** {agent_name}  \n**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n---\n\n"
        filepath.write_text(header + content, encoding="utf-8")

        return f"SUCCESS: Report saved to agents/reports/{agent_name}/{filename}"
    except Exception as e:
        return f"ERROR saving report: {e}"


@tool("Read Latest Report")
def read_latest_report(agent_name: str) -> str:
    """
    Read the most recent report from a specific agent.
    agent_name: one of 'team_leader', 'frontend', 'backend', 'security', 'affiliate'
    Returns the content of the latest report from that agent.
    """
    try:
        report_dir = REPORTS_DIR / agent_name
        if not report_dir.exists():
            return f"No reports found for agent: {agent_name}"

        reports = sorted(report_dir.glob("*.md"), key=lambda f: f.stat().st_mtime, reverse=True)
        if not reports:
            return f"No reports found in {report_dir}"

        latest = reports[0]
        content = latest.read_text(encoding="utf-8")
        return f"--- Latest report from {agent_name} ({latest.name}) ---\n\n{content}"
    except Exception as e:
        return f"ERROR reading report: {e}"


# ── Inter-agent messaging ─────────────────────────────────────────────────────

@tool("Send Message to Agent")
def send_message_to_agent(from_agent: str, to_agent: str, subject: str, message: str) -> str:
    """
    Send a message from one agent to another.
    Use this when you need information or assistance from a specific agent.

    from_agent: your agent name (e.g., 'frontend_agent')
    to_agent: recipient agent name (e.g., 'backend_agent')
    subject: brief subject of the message
    message: the full message content

    Valid agent names: team_leader, frontend_agent, backend_agent,
                       security_agent, affiliate_agent
    """
    try:
        messages = _load_messages()

        new_message = {
            "id": f"msg_{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
            "from": from_agent,
            "to": to_agent,
            "subject": subject,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "read": False
        }

        messages.append(new_message)
        _save_messages(messages)

        return f"SUCCESS: Message sent to {to_agent}. Subject: '{subject}'"
    except Exception as e:
        return f"ERROR sending message: {e}"


@tool("Read My Messages")
def read_agent_messages(agent_name: str) -> str:
    """
    Read all unread messages addressed to a specific agent.
    agent_name: your agent's name (e.g., 'backend_agent')
    Returns all unread messages and marks them as read.
    """
    try:
        messages = _load_messages()
        my_messages = [m for m in messages if m.get("to") == agent_name]

        if not my_messages:
            return f"No messages for {agent_name}."

        # Mark as read
        for m in messages:
            if m.get("to") == agent_name:
                m["read"] = True
        _save_messages(messages)

        output = [f"📬 Messages for {agent_name}:\n"]
        for msg in my_messages:
            status = "✅ READ" if msg.get("read") else "🔵 NEW"
            output.append(
                f"[{status}] From: {msg['from']} | {msg['timestamp'][:16]}\n"
                f"Subject: {msg['subject']}\n"
                f"Message: {msg['message']}\n"
                f"{'─' * 60}"
            )

        return "\n".join(output)
    except Exception as e:
        return f"ERROR reading messages: {e}"


# ── Internal helpers ──────────────────────────────────────────────────────────

def _load_messages() -> list:
    if MESSAGES_FILE.exists():
        try:
            return json.loads(MESSAGES_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
    return []


def _save_messages(messages: list) -> None:
    MESSAGES_FILE.write_text(json.dumps(messages, indent=2), encoding="utf-8")
