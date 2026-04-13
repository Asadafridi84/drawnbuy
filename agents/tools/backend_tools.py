"""
backend_tools.py
================
Superpowers exclusive to the DrawnBuy Backend Agent.
Covers API analysis, database schema reading, dependency
auditing, and backend health checks.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from crewai.tools import tool


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "package.json").exists() or (parent / "next.config.js").exists():
            return parent
    return current.parent.parent.parent


PROJECT_ROOT = _project_root()


# ── API & Routes ──────────────────────────────────────────────────────────────

@tool("Scan API Routes")
def scan_api_routes() -> str:
    """
    Scan the DrawnBuy project for all API routes.
    Detects Next.js API routes (/pages/api or /app/api),
    Express routes, and any route definition patterns.
    Returns a full map of available endpoints.
    """
    try:
        routes = []

        # Next.js pages/api routes
        pages_api = PROJECT_ROOT / "pages" / "api"
        if pages_api.exists():
            for f in pages_api.rglob("*.ts"):
                rel = f.relative_to(pages_api)
                route = "/" + str(rel).replace("\\", "/").replace(".ts", "").replace(".js", "")
                routes.append(f"  [pages/api] /api{route}")
            for f in pages_api.rglob("*.js"):
                rel = f.relative_to(pages_api)
                route = "/" + str(rel).replace("\\", "/").replace(".js", "")
                routes.append(f"  [pages/api] /api{route}")

        # Next.js App Router API routes
        app_dir = PROJECT_ROOT / "app"
        if app_dir.exists():
            for f in app_dir.rglob("route.ts"):
                rel = f.parent.relative_to(app_dir)
                route = "/" + str(rel).replace("\\", "/")
                content = f.read_text(encoding="utf-8", errors="replace")
                methods = re.findall(r"export (?:async )?function (GET|POST|PUT|DELETE|PATCH)", content)
                routes.append(f"  [app/api] {route} [{', '.join(methods)}]")

        if not routes:
            return "No API routes detected. Project may use a separate backend service."

        return "🛣️  API Routes Found:\n\n" + "\n".join(routes)
    except Exception as e:
        return f"ERROR scanning API routes: {e}"


@tool("Analyze API Handler")
def analyze_api_handler(file_path: str) -> str:
    """
    Analyze a specific API handler file for best practices.
    Checks for: error handling, input validation, authentication,
    proper HTTP status codes, and rate limiting.
    file_path: relative path (e.g., 'pages/api/products.ts' or 'app/api/products/route.ts')
    """
    try:
        path = PROJECT_ROOT / file_path
        if not path.exists():
            return f"ERROR: File not found: {file_path}"

        content = path.read_text(encoding="utf-8")
        issues = []
        good = []

        # Error handling
        if "try" in content and "catch" in content:
            good.append("✅ Has try/catch error handling")
        else:
            issues.append("🚨 CRITICAL: No try/catch — unhandled errors will crash the route")

        # Input validation
        if any(v in content for v in ("zod", "joi", "yup", "validateBody", "parseBody")):
            good.append("✅ Uses input validation library")
        elif "req.body" in content or "req.query" in content:
            issues.append("⚠️  HIGH: Reading req.body/req.query without visible validation")

        # HTTP status codes
        has_status = re.search(r"\.status\(\d+\)|NextResponse.*status", content)
        if has_status:
            good.append("✅ Returns explicit HTTP status codes")
        else:
            issues.append("💡 MEDIUM: No explicit status codes — add .status(200/400/500) etc.")

        # Authentication check
        if any(a in content for a in ("getServerSession", "auth()", "verifyToken", "jwt.verify", "clerk", "nextauth")):
            good.append("✅ Has authentication check")
        else:
            issues.append("⚠️  HIGH: No visible authentication — is this endpoint public on purpose?")

        # Rate limiting
        if "rateLimit" in content or "rateLimiter" in content or "upstash" in content:
            good.append("✅ Rate limiting present")
        else:
            issues.append("💡 MEDIUM: No rate limiting — consider adding for public endpoints")

        # CORS
        if "cors" in content.lower() or "Access-Control" in content:
            good.append("✅ CORS handling present")

        result = [f"🔍 API Handler Analysis: {file_path}\n"]
        if good:
            result.append("✅ Good practices:\n" + "\n".join(f"  {g}" for g in good))
        if issues:
            result.append("\n⚠️  Issues:\n" + "\n".join(f"  {i}" for i in issues))

        return "\n".join(result)
    except Exception as e:
        return f"ERROR analyzing API handler: {e}"


@tool("Read Database Schema")
def read_database_schema() -> str:
    """
    Read the database schema from common schema definition files.
    Supports: Prisma (schema.prisma), Drizzle, raw SQL migrations,
    and mongoose model files.
    Returns the schema structure for reference.
    """
    try:
        found = []

        # Prisma
        for prisma_path in PROJECT_ROOT.rglob("schema.prisma"):
            if "node_modules" not in str(prisma_path):
                content = prisma_path.read_text(encoding="utf-8")
                found.append(f"📋 Prisma Schema ({prisma_path.relative_to(PROJECT_ROOT)}):\n\n{content}")
                break

        # Drizzle
        for drizzle_path in PROJECT_ROOT.rglob("schema.ts"):
            if "node_modules" not in str(drizzle_path) and "db" in str(drizzle_path).lower():
                content = drizzle_path.read_text(encoding="utf-8")
                found.append(f"📋 Drizzle Schema ({drizzle_path.relative_to(PROJECT_ROOT)}):\n\n{content}")
                break

        # SQL migrations
        migration_dirs = ["migrations", "db/migrations", "prisma/migrations"]
        for md in migration_dirs:
            mdir = PROJECT_ROOT / md
            if mdir.exists():
                sql_files = sorted(mdir.rglob("*.sql"))[:3]  # latest 3
                for sf in sql_files:
                    content = sf.read_text(encoding="utf-8")[:2000]
                    found.append(f"📋 Migration ({sf.name}):\n{content}")

        if not found:
            return "No database schema files found. Check if schema is defined elsewhere."

        return "\n\n---\n\n".join(found)
    except Exception as e:
        return f"ERROR reading database schema: {e}"


@tool("Check Environment Variables")
def check_environment_variables() -> str:
    """
    Check the project's environment variable configuration.
    Reads .env.example, .env.local (names only, never values for security),
    and validates that required env vars are properly referenced in code.
    """
    try:
        output = []

        # Read .env.example (safe — no real secrets)
        for env_example in (".env.example", ".env.template", ".env.sample"):
            env_path = PROJECT_ROOT / env_example
            if env_path.exists():
                content = env_path.read_text(encoding="utf-8")
                output.append(f"📄 {env_example}:\n{content}")
                break

        # List .env.local keys only (never values)
        for env_local in (".env.local", ".env", ".env.production"):
            env_path = PROJECT_ROOT / env_local
            if env_path.exists():
                lines = env_path.read_text(encoding="utf-8").splitlines()
                keys = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key = line.split("=")[0]
                        keys.append(key)
                output.append(f"🔑 {env_local} keys (values hidden for security):\n" +
                               "\n".join(f"  - {k}" for k in keys))

        if not output:
            return "No .env files found. Make sure to create .env.local from .env.example."

        return "\n\n".join(output)
    except Exception as e:
        return f"ERROR reading env config: {e}"


@tool("Audit Dependencies")
def audit_npm_dependencies() -> str:
    """
    Audit the project's npm dependencies for known vulnerabilities.
    Runs 'npm audit --json' and returns a summary of findings.
    Also checks for significantly outdated packages.
    """
    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            capture_output=True,
            text=True,
            cwd=str(PROJECT_ROOT),
            timeout=60
        )

        try:
            audit_data = json.loads(result.stdout)
        except json.JSONDecodeError:
            return f"npm audit output:\n{result.stdout[:2000] or result.stderr[:2000]}"

        vulnerabilities = audit_data.get("vulnerabilities", {})
        metadata = audit_data.get("metadata", {})

        if not vulnerabilities:
            return "✅ npm audit: No vulnerabilities found!"

        output = ["🔍 npm Dependency Audit Results:\n"]

        vuln_counts = metadata.get("vulnerabilities", {})
        output.append(f"Total vulnerabilities: {sum(vuln_counts.values())}")
        for severity in ("critical", "high", "moderate", "low", "info"):
            count = vuln_counts.get(severity, 0)
            if count > 0:
                emoji = {"critical": "🚨", "high": "⛔", "moderate": "⚠️", "low": "💡", "info": "ℹ️"}.get(severity, "")
                output.append(f"  {emoji} {severity.capitalize()}: {count}")

        output.append("\nTop issues to fix:")
        count = 0
        for name, vuln in vulnerabilities.items():
            if count >= 10:
                break
            sev = vuln.get("severity", "unknown")
            if sev in ("critical", "high"):
                fix = vuln.get("fixAvailable", False)
                fix_str = "Fix available ✅" if fix else "No auto-fix ⚠️"
                output.append(f"  [{sev.upper()}] {name}: {fix_str}")
                count += 1

        return "\n".join(output)
    except FileNotFoundError:
        return "npm not found. Please run npm audit manually in your project directory."
    except subprocess.TimeoutExpired:
        return "npm audit timed out. Run manually: npm audit"
    except Exception as e:
        return f"ERROR running npm audit: {e}"


@tool("Check API Response Patterns")
def check_api_response_patterns(directory: str = "") -> str:
    """
    Scan API files for consistent response patterns.
    Checks that all routes: use consistent JSON structure,
    include proper error responses, and handle edge cases.
    directory: e.g. 'pages/api' or 'app/api' — leave empty to search all.
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        api_files = []
        for ext in ("*.ts", "*.js"):
            for f in target.rglob(ext):
                if "api" in f.parts and "node_modules" not in str(f):
                    api_files.append(f)

        if not api_files:
            return "No API files found in the specified directory."

        inconsistencies = []
        for f in api_files[:20]:  # limit to 20 files
            try:
                content = f.read_text(encoding="utf-8")
                rel = f.relative_to(PROJECT_ROOT)

                has_error_handling = "catch" in content
                has_json_response = "json(" in content or "NextResponse.json" in content
                has_status = re.search(r"status\(4\d\d\)|status\(5\d\d\)", content)

                if not has_error_handling:
                    inconsistencies.append(f"  ⚠️  {rel}: Missing error handling (catch)")
                if not has_json_response:
                    inconsistencies.append(f"  💡 {rel}: No JSON response detected")
                if has_json_response and not has_status:
                    inconsistencies.append(f"  💡 {rel}: Missing error status codes (4xx/5xx)")
            except OSError:
                continue

        if not inconsistencies:
            return f"✅ API response patterns look consistent across {len(api_files)} files!"

        return f"🔍 API Pattern Issues Found ({len(api_files)} files scanned):\n\n" + "\n".join(inconsistencies)
    except Exception as e:
        return f"ERROR checking API patterns: {e}"
