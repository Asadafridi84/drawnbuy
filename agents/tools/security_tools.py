"""
security_tools.py
=================
Superpowers exclusive to the DrawnBuy Security Agent.
Covers OWASP vulnerability scanning, dependency CVE checking,
security header analysis, secrets detection, and threat reporting.
"""

import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from crewai.tools import tool


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "package.json").exists() or (parent / "next.config.js").exists():
            return parent
    return current.parent.parent.parent


PROJECT_ROOT = _project_root()

# ── Secret / Credential Patterns ──────────────────────────────────────────────
SECRET_PATTERNS = [
    (r'["\']?(?:api[_-]?key|apikey)["\']?\s*[:=]\s*["\']([A-Za-z0-9\-_]{20,})["\']', "API Key"),
    (r'["\']?(?:secret|password|passwd|pwd)["\']?\s*[:=]\s*["\']([^"\']{8,})["\']', "Secret/Password"),
    (r'(?:sk|pk)[-_](?:live|test)[-_][A-Za-z0-9]{20,}', "Stripe Key"),
    (r'AKIA[0-9A-Z]{16}', "AWS Access Key"),
    (r'eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+', "JWT Token"),
    (r'ghp_[A-Za-z0-9]{36}', "GitHub Personal Access Token"),
    (r'(?:mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@', "MongoDB URI with credentials"),
    (r'postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@', "PostgreSQL URI with credentials"),
]

# ── XSS / Injection Patterns ──────────────────────────────────────────────────
XSS_PATTERNS = [
    (r'dangerouslySetInnerHTML', "React dangerouslySetInnerHTML — potential XSS"),
    (r'innerHTML\s*=', "Direct innerHTML assignment — potential XSS"),
    (r'document\.write\(', "document.write() — potential XSS"),
    (r'eval\s*\(', "eval() usage — potential code injection"),
    (r'new Function\s*\(', "new Function() — potential code injection"),
]

# ── SQL Injection Patterns ─────────────────────────────────────────────────────
SQLI_PATTERNS = [
    (r'\$\{.*(?:req|body|query|params).*\}', "Template literal with user input in query"),
    (r'`.*SELECT.*\$\{', "Potential SQL injection in template literal"),
    (r'query\s*\+\s*(?:req|body|param)', "String concatenation in DB query"),
]


# ── Security scanning tools ───────────────────────────────────────────────────

@tool("Scan for Hardcoded Secrets")
def scan_for_secrets(directory: str = "") -> str:
    """
    Scan the DrawnBuy codebase for hardcoded secrets, API keys,
    passwords, tokens, and credentials that should be in .env files.
    directory: relative path to scan (e.g., 'app', 'components') — leave empty for full scan.
    CRITICAL: This is the most important security check — run this regularly.
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        findings = []
        files_scanned = 0

        # Extensions to scan
        scan_exts = {".ts", ".tsx", ".js", ".jsx", ".json", ".env", ".yaml", ".yml"}
        skip_dirs = {"node_modules", ".next", "dist", ".git", "__pycache__", ".vercel"}

        for file in target.rglob("*"):
            if file.is_dir():
                continue
            if any(skip in file.parts for skip in skip_dirs):
                continue
            if file.suffix not in scan_exts:
                continue
            # Skip .env.example files (these are templates, not real secrets)
            if "example" in file.name.lower() or "template" in file.name.lower():
                continue

            try:
                content = file.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue

            files_scanned += 1
            rel_path = file.relative_to(PROJECT_ROOT)

            for pattern, label in SECRET_PATTERNS:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    findings.append(f"🚨 CRITICAL [{label}] in {rel_path}")
                    # Show first 20 chars of match, masked
                    masked = matches[0][:8] + "***" if matches[0] else "***"
                    findings.append(f"   Found: {masked}...")

        if not findings:
            return f"✅ No hardcoded secrets found. ({files_scanned} files scanned)"

        result = [f"🚨 SECRET SCAN RESULTS ({files_scanned} files scanned):\n"]
        result.append(f"⛔ {len(findings)//2} potential secret(s) found!\n")
        result.extend(findings)
        result.append("\n🔧 Remediation: Move all secrets to .env.local and use process.env.VARIABLE_NAME")
        return "\n".join(result)
    except Exception as e:
        return f"ERROR scanning for secrets: {e}"


@tool("Scan for XSS Vulnerabilities")
def scan_for_xss(directory: str = "") -> str:
    """
    Scan the frontend codebase for Cross-Site Scripting (XSS) vulnerabilities.
    Checks for dangerouslySetInnerHTML, innerHTML, eval(), and other XSS vectors.
    directory: relative path (e.g., 'components', 'app') — leave empty for full scan.
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        findings = []
        files_scanned = 0
        scan_exts = {".ts", ".tsx", ".js", ".jsx"}
        skip_dirs = {"node_modules", ".next", "dist"}

        for file in target.rglob("*"):
            if any(skip in file.parts for skip in skip_dirs):
                continue
            if file.suffix not in scan_exts:
                continue

            try:
                content = file.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue

            files_scanned += 1
            rel_path = file.relative_to(PROJECT_ROOT)

            for pattern, label in XSS_PATTERNS:
                matches = re.findall(pattern, content)
                if matches:
                    # Find line numbers
                    lines = content.splitlines()
                    for i, line in enumerate(lines, 1):
                        if re.search(pattern, line):
                            findings.append(f"⚠️  [{label}] {rel_path}:{i}")
                            findings.append(f"   Line: {line.strip()[:100]}")
                            break

        if not findings:
            return f"✅ No XSS vulnerabilities found. ({files_scanned} files scanned)"

        return f"🔍 XSS Scan Results ({files_scanned} files):\n\n" + "\n".join(findings)
    except Exception as e:
        return f"ERROR scanning for XSS: {e}"


@tool("Check Security Headers")
def check_security_headers() -> str:
    """
    Check if DrawnBuy has proper security HTTP headers configured.
    Looks in Next.js config, middleware, and API routes for:
    CSP, HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy, etc.
    """
    try:
        headers_found = {}
        recommendations = []

        required_headers = {
            "Content-Security-Policy": "Prevents XSS and injection attacks",
            "Strict-Transport-Security": "Forces HTTPS connections",
            "X-Frame-Options": "Prevents clickjacking",
            "X-Content-Type-Options": "Prevents MIME type sniffing",
            "Referrer-Policy": "Controls referrer information",
            "Permissions-Policy": "Controls browser features (formerly Feature-Policy)",
        }

        scan_files = [
            PROJECT_ROOT / "next.config.js",
            PROJECT_ROOT / "next.config.ts",
            PROJECT_ROOT / "next.config.mjs",
            PROJECT_ROOT / "middleware.ts",
            PROJECT_ROOT / "middleware.js",
        ]

        combined_content = ""
        for f in scan_files:
            if f.exists():
                combined_content += f.read_text(encoding="utf-8", errors="replace")

        # Also check pages/_document.tsx
        doc_path = PROJECT_ROOT / "pages" / "_document.tsx"
        if doc_path.exists():
            combined_content += doc_path.read_text(encoding="utf-8", errors="replace")

        output = ["🔒 Security Headers Analysis:\n"]

        for header, description in required_headers.items():
            if header.lower() in combined_content.lower():
                headers_found[header] = "✅ FOUND"
                output.append(f"✅ {header}")
            else:
                headers_found[header] = "❌ MISSING"
                output.append(f"❌ MISSING: {header} — {description}")
                recommendations.append(header)

        score = len([v for v in headers_found.values() if "FOUND" in v])
        total = len(required_headers)
        output.append(f"\nSecurity Headers Score: {score}/{total}")

        if recommendations:
            output.append(f"\n🔧 Add these to next.config.js headers():")
            output.append("""
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval'; ..." },
      ]
    }]
  }""")

        return "\n".join(output)
    except Exception as e:
        return f"ERROR checking security headers: {e}"


@tool("Scan for SQL Injection")
def scan_for_sql_injection(directory: str = "") -> str:
    """
    Scan backend code for potential SQL injection vulnerabilities.
    Checks for string concatenation in queries, unparameterized inputs,
    and unsafe template literals in database queries.
    directory: e.g. 'pages/api', 'app/api', 'lib' — leave empty for full scan.
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        findings = []
        files_scanned = 0
        scan_exts = {".ts", ".js"}
        skip_dirs = {"node_modules", ".next", "dist"}

        for file in target.rglob("*"):
            if any(skip in file.parts for skip in skip_dirs):
                continue
            if file.suffix not in scan_exts:
                continue

            try:
                content = file.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue

            files_scanned += 1
            rel_path = file.relative_to(PROJECT_ROOT)

            for pattern, label in SQLI_PATTERNS:
                lines = content.splitlines()
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line):
                        findings.append(f"⚠️  [{label}] {rel_path}:{i}")
                        findings.append(f"   {line.strip()[:120]}")

        if not findings:
            return f"✅ No SQL injection patterns found. ({files_scanned} files scanned)"

        return f"🔍 SQL Injection Scan ({files_scanned} files):\n\n" + "\n".join(findings)
    except Exception as e:
        return f"ERROR scanning for SQLi: {e}"


@tool("Check Authentication Setup")
def check_authentication_setup() -> str:
    """
    Analyze the DrawnBuy authentication implementation.
    Checks for: auth library usage (NextAuth, Clerk, Auth0, Supabase),
    protected route patterns, JWT handling, session management,
    and password security practices.
    """
    try:
        output = []
        auth_indicators = {
            "next-auth": "NextAuth.js",
            "clerk": "Clerk",
            "auth0": "Auth0",
            "supabase": "Supabase Auth",
            "@lucia-auth": "Lucia Auth",
            "firebase/auth": "Firebase Auth",
            "better-auth": "Better Auth",
        }

        # Check package.json for auth library
        pkg_path = PROJECT_ROOT / "package.json"
        auth_lib = "Unknown"
        if pkg_path.exists():
            try:
                pkg = json.loads(pkg_path.read_text())
                all_deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                for pkg_name, lib_name in auth_indicators.items():
                    if pkg_name in all_deps:
                        auth_lib = lib_name
                        break
            except (json.JSONDecodeError, OSError):
                pass

        output.append(f"🔑 Authentication Library Detected: {auth_lib}\n")

        # Find auth-related files
        auth_files = []
        for pattern in ("auth.ts", "auth.js", "[...nextauth]*", "middleware.ts"):
            for f in PROJECT_ROOT.rglob(pattern):
                if "node_modules" not in str(f):
                    auth_files.append(str(f.relative_to(PROJECT_ROOT)))

        if auth_files:
            output.append(f"Auth-related files found:")
            for f in auth_files[:8]:
                output.append(f"  📄 {f}")

        # Check for middleware protection
        middleware_path = PROJECT_ROOT / "middleware.ts"
        if not middleware_path.exists():
            middleware_path = PROJECT_ROOT / "middleware.js"

        if middleware_path.exists():
            content = middleware_path.read_text(encoding="utf-8")
            if "auth" in content.lower() or "session" in content.lower():
                output.append("\n✅ Middleware has authentication checks")
            else:
                output.append("\n⚠️  Middleware exists but may not check authentication")
        else:
            output.append("\n⚠️  No middleware.ts found — routes may not be protected globally")
            output.append("   Recommendation: Add middleware for centralized auth protection")

        # Check for HTTPS-only cookies
        session_issues = []
        for f in PROJECT_ROOT.rglob("*.ts"):
            if "node_modules" in str(f) or "auth" not in f.name.lower():
                continue
            try:
                content = f.read_text(encoding="utf-8")
                if "httpOnly: false" in content:
                    session_issues.append(f"⚠️  httpOnly: false in {f.relative_to(PROJECT_ROOT)}")
                if "secure: false" in content:
                    session_issues.append(f"⚠️  secure: false in {f.relative_to(PROJECT_ROOT)}")
                if "sameSite" not in content and "cookie" in content.lower():
                    session_issues.append(f"💡 Missing sameSite in {f.relative_to(PROJECT_ROOT)}")
            except OSError:
                continue

        if session_issues:
            output.append("\nCookie/Session Issues:")
            output.extend(session_issues)

        return "\n".join(output)
    except Exception as e:
        return f"ERROR checking authentication: {e}"


@tool("Generate Security Report")
def generate_security_report(findings: str) -> str:
    """
    Generate a formatted security report from scan findings.
    Takes a string of security findings and creates a structured
    Markdown report with severity ratings, remediation steps,
    and an overall security score.
    findings: text summary of what was found during security scans
    """
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Count severity indicators in findings
        critical = findings.lower().count("critical") + findings.count("🚨")
        high = findings.lower().count("high") + findings.count("⛔")
        medium = findings.lower().count("medium") + findings.count("⚠️")
        low = findings.lower().count("low") + findings.count("💡")

        # Calculate score (100 - weighted deductions)
        score = max(0, 100 - (critical * 25) - (high * 10) - (medium * 5) - (low * 2))

        if score >= 80:
            rating = "🟢 GOOD"
        elif score >= 60:
            rating = "🟡 FAIR"
        elif score >= 40:
            rating = "🟠 POOR"
        else:
            rating = "🔴 CRITICAL"

        report = f"""# DrawnBuy Security Report
**Generated:** {timestamp}
**Overall Security Score:** {score}/100 — {rating}

## Vulnerability Summary
| Severity | Count |
|----------|-------|
| 🚨 Critical | {critical} |
| ⛔ High | {high} |
| ⚠️ Medium | {medium} |
| 💡 Low | {low} |

## Findings

{findings}

## Immediate Action Items
{"⛔ STOP — Fix critical and high severity issues before next deployment!" if critical + high > 0 else "✅ No blocking issues — review medium/low items in next sprint."}

## Recommended Next Steps
1. Fix all Critical findings immediately
2. Schedule High findings for this sprint
3. Plan Medium findings for next sprint
4. Log Low findings as tech debt

---
*Report generated by DrawnBuy Security Agent*
"""

        reports_dir = PROJECT_ROOT / "agents" / "reports" / "security"
        reports_dir.mkdir(parents=True, exist_ok=True)
        ts_file = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = reports_dir / f"security_report_{ts_file}.md"
        report_path.write_text(report, encoding="utf-8")

        return f"✅ Security report saved to: agents/reports/security/security_report_{ts_file}.md\n\nScore: {score}/100 — {rating}"
    except Exception as e:
        return f"ERROR generating security report: {e}"
