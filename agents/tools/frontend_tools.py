"""
frontend_tools.py
=================
Superpowers exclusive to the DrawnBuy Frontend Agent.
Covers React/Next.js analysis, component auditing,
performance checking, and accessibility inspection.
"""

import os
import re
import json
from pathlib import Path
from crewai.tools import tool

# ── Project root ──────────────────────────────────────────────────────────────
def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "package.json").exists() or (parent / "next.config.js").exists():
            return parent
    return current.parent.parent.parent


PROJECT_ROOT = _project_root()


# ── Next.js / React specific ──────────────────────────────────────────────────

@tool("Scan React Components")
def scan_react_components(directory: str = "") -> str:
    """
    Scan a directory (or the full project) for all React components (.tsx, .jsx, .js).
    Returns a summary of component names, props patterns, and hook usage.
    directory: relative path from project root (e.g., 'components', 'app', 'pages')
               Leave empty to scan all.
    """
    try:
        target = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        components = []
        extensions = {".tsx", ".jsx", ".js", ".ts"}

        for file in target.rglob("*"):
            if file.suffix not in extensions:
                continue
            if any(skip in file.parts for skip in ("node_modules", ".next", "dist", "__pycache__")):
                continue

            try:
                content = file.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue

            # Detect React component patterns
            is_component = (
                "export default" in content
                or "export const" in content
                or re.search(r"return\s*\(?\s*<", content)
            )

            if is_component:
                hooks = re.findall(r"\buse[A-Z]\w+\b", content)
                props = re.findall(r"interface \w+Props", content)
                rel_path = file.relative_to(PROJECT_ROOT)
                components.append(
                    f"  📦 {rel_path}\n"
                    f"     Hooks: {', '.join(set(hooks)) or 'none'}\n"
                    f"     Props interfaces: {', '.join(props) or 'none'}"
                )

        if not components:
            return f"No React components found in: {target}"

        return f"🔍 React Components Found ({len(components)}):\n\n" + "\n\n".join(components)
    except Exception as e:
        return f"ERROR scanning components: {e}"


@tool("Check Next.js Config")
def check_nextjs_config() -> str:
    """
    Read and analyze the Next.js configuration (next.config.js or next.config.ts).
    Returns the current config with recommendations for improvements like
    image optimization, internationalization, and performance settings.
    """
    try:
        for config_name in ("next.config.js", "next.config.ts", "next.config.mjs"):
            config_path = PROJECT_ROOT / config_name
            if config_path.exists():
                content = config_path.read_text(encoding="utf-8")
                analysis = _analyze_nextjs_config(content)
                return f"📋 Next.js Config ({config_name}):\n\n{content}\n\n---\n\n{analysis}"
        return "⚠️ No next.config.js found. Consider creating one for optimization settings."
    except Exception as e:
        return f"ERROR reading Next.js config: {e}"


def _analyze_nextjs_config(content: str) -> str:
    tips = []
    if "images" not in content:
        tips.append("💡 Add 'images' config for domain allowlisting and optimization.")
    if "compress" not in content:
        tips.append("💡 Add 'compress: true' to enable gzip compression.")
    if "headers" not in content:
        tips.append("💡 Add security headers (CSP, HSTS, X-Frame-Options) via 'headers()'.")
    if "poweredByHeader" not in content:
        tips.append("💡 Add 'poweredByHeader: false' to hide Next.js fingerprint.")
    if not tips:
        return "✅ Config looks good!"
    return "Recommendations:\n" + "\n".join(tips)


@tool("Audit Page Performance")
def audit_page_performance(page_file: str) -> str:
    """
    Audit a Next.js page or component file for performance issues.
    Checks for: missing lazy loading, large imports, missing memoization,
    unoptimized images, missing metadata, blocking scripts.
    page_file: path relative to project root (e.g., 'app/page.tsx')
    """
    try:
        path = PROJECT_ROOT / page_file
        if not path.exists():
            return f"ERROR: File not found: {page_file}"

        content = path.read_text(encoding="utf-8")
        issues = []
        good = []

        # Check for lazy loading
        if "dynamic(" in content or "lazy(" in content:
            good.append("✅ Uses dynamic imports / lazy loading")
        elif "import " in content and len(re.findall(r"^import ", content, re.MULTILINE)) > 10:
            issues.append("⚠️  HIGH: Many static imports — consider dynamic() for heavy components")

        # Check for image optimization
        if "next/image" in content or "Image" in content:
            good.append("✅ Uses Next.js Image component")
        elif "<img" in content.lower():
            issues.append("🚨 CRITICAL: Using <img> instead of Next.js <Image> — missing optimization")

        # Check for memoization
        if "useMemo" in content or "useCallback" in content or "React.memo" in content:
            good.append("✅ Uses memoization")
        elif re.search(r"\bmap\(|\.filter\(|\.reduce\(", content):
            issues.append("💡 LOW: Consider useMemo for expensive array operations")

        # Check metadata (Next.js 13+ app dir)
        if "export const metadata" in content or "export async function generateMetadata" in content:
            good.append("✅ Exports metadata for SEO")
        elif "page.tsx" in page_file or "page.jsx" in page_file:
            issues.append("⚠️  MEDIUM: No metadata export — add for SEO")

        # Check for Suspense boundaries
        if "Suspense" in content:
            good.append("✅ Uses Suspense boundaries")
        elif "async" in content and "await" in content:
            issues.append("💡 LOW: Async operations present — consider Suspense boundaries")

        result = [f"🔍 Performance Audit: {page_file}\n"]
        if good:
            result.append("✅ Good practices:\n" + "\n".join(f"  {g}" for g in good))
        if issues:
            result.append("\n⚠️  Issues found:\n" + "\n".join(f"  {i}" for i in issues))
        if not issues:
            result.append("\n🎉 No performance issues found!")

        return "\n".join(result)
    except Exception as e:
        return f"ERROR auditing file: {e}"


@tool("Check Accessibility")
def check_accessibility(file_path: str) -> str:
    """
    Check a React/Next.js component file for common accessibility (a11y) issues.
    Checks WCAG 2.1 AA compliance: alt text, ARIA labels, semantic HTML,
    keyboard navigation, color contrast markers.
    file_path: path relative to project root (e.g., 'components/ProductCard.tsx')
    """
    try:
        path = PROJECT_ROOT / file_path
        if not path.exists():
            return f"ERROR: File not found: {file_path}"

        content = path.read_text(encoding="utf-8")
        issues = []
        good = []

        # Image alt text
        img_tags = re.findall(r"<(?:img|Image)[^>]*>", content, re.IGNORECASE)
        for img in img_tags:
            if "alt=" not in img:
                issues.append("🚨 CRITICAL: <img> or <Image> missing alt= attribute")
                break
        if img_tags and all("alt=" in img for img in img_tags):
            good.append("✅ All images have alt attributes")

        # Button accessibility
        buttons = re.findall(r"<button[^>]*>.*?</button>", content, re.DOTALL | re.IGNORECASE)
        for btn in buttons:
            if not re.search(r"aria-label=|aria-labelledby=", btn) and not re.search(r">[^<]{2,}", btn):
                issues.append("🚨 CRITICAL: Button may lack accessible label (no text or aria-label)")
                break

        # Link accessibility
        if '<a href=""' in content or "href=''" in content:
            issues.append("⚠️  HIGH: Empty href on anchor tag")

        # ARIA roles
        if "role=" in content:
            good.append("✅ Uses ARIA roles")

        # Semantic HTML
        semantic_tags = re.findall(r"<(main|nav|header|footer|section|article|aside|h[1-6])", content)
        if semantic_tags:
            good.append(f"✅ Uses semantic HTML: {', '.join(set(semantic_tags))}")
        else:
            issues.append("💡 LOW: Consider using semantic HTML elements (main, nav, section, etc.)")

        # Keyboard navigation
        if "tabIndex" in content or "tabindex" in content:
            good.append("✅ Custom tabIndex found — verify logical tab order")
        if "onKeyDown" in content or "onKeyPress" in content:
            good.append("✅ Keyboard event handlers present")
        elif re.search(r"onClick", content) and "onKeyDown" not in content:
            issues.append("💡 MEDIUM: onClick without onKeyDown — non-button clickables need keyboard support")

        result = [f"♿ Accessibility Audit: {file_path}\n"]
        if good:
            result.append("✅ Good practices:\n" + "\n".join(f"  {g}" for g in good))
        if issues:
            result.append("\n⚠️  Issues:\n" + "\n".join(f"  {i}" for i in issues))
        if not issues:
            result.append("\n🎉 No accessibility issues found!")

        return "\n".join(result)
    except Exception as e:
        return f"ERROR checking accessibility: {e}"


@tool("Read Package JSON")
def read_package_json() -> str:
    """
    Read and analyze the project's package.json.
    Returns all dependencies with version numbers.
    Highlights outdated patterns and missing recommended packages.
    """
    try:
        pkg_path = PROJECT_ROOT / "package.json"
        if not pkg_path.exists():
            return "ERROR: package.json not found"

        pkg = json.loads(pkg_path.read_text(encoding="utf-8"))

        deps = pkg.get("dependencies", {})
        dev_deps = pkg.get("devDependencies", {})

        output = [f"📦 Package: {pkg.get('name', 'unknown')} v{pkg.get('version', '?')}\n"]
        output.append(f"Scripts: {', '.join(pkg.get('scripts', {}).keys())}\n")

        output.append(f"\nDependencies ({len(deps)}):")
        for name, version in sorted(deps.items()):
            output.append(f"  {name}: {version}")

        output.append(f"\nDev Dependencies ({len(dev_deps)}):")
        for name, version in sorted(dev_deps.items()):
            output.append(f"  {name}: {version}")

        # Recommendations
        recs = []
        if "framer-motion" not in deps:
            recs.append("💡 Consider framer-motion for smooth animations")
        if "next-seo" not in deps:
            recs.append("💡 Consider next-seo for SEO management")
        if "@tanstack/react-query" not in deps and "swr" not in deps:
            recs.append("💡 Consider React Query or SWR for data fetching")

        if recs:
            output.append("\nRecommendations:")
            output.extend(recs)

        return "\n".join(output)
    except Exception as e:
        return f"ERROR reading package.json: {e}"


@tool("Find Tailwind Classes")
def find_tailwind_usage(component: str) -> str:
    """
    Find all Tailwind CSS classes used in a component file and check for
    consistency, dark mode support, and responsive design patterns.
    component: path relative to project root (e.g., 'components/ProductCard.tsx')
    """
    try:
        path = PROJECT_ROOT / component
        if not path.exists():
            return f"ERROR: File not found: {component}"

        content = path.read_text(encoding="utf-8")

        # Extract className values
        class_matches = re.findall(r'className[=\s]*["\`\']([^"\`\']+)["\`\']', content)
        all_classes = set()
        for match in class_matches:
            all_classes.update(match.split())

        responsive = [c for c in all_classes if re.match(r"(sm:|md:|lg:|xl:)", c)]
        dark = [c for c in all_classes if c.startswith("dark:")]
        focus = [c for c in all_classes if c.startswith("focus:")]
        hover = [c for c in all_classes if c.startswith("hover:")]

        output = [f"🎨 Tailwind Usage in {component}:\n"]
        output.append(f"Total unique classes: {len(all_classes)}")
        output.append(f"Responsive classes ({len(responsive)}): {', '.join(sorted(responsive)) or 'none'}")
        output.append(f"Dark mode classes ({len(dark)}): {', '.join(sorted(dark)) or 'none ⚠️'}")
        output.append(f"Focus classes ({len(focus)}): {', '.join(sorted(focus)) or 'none ⚠️'}")
        output.append(f"Hover classes ({len(hover)}): {', '.join(sorted(hover)) or 'none'}")

        if not dark:
            output.append("\n⚠️ No dark mode classes found — consider adding dark: variants")
        if not responsive:
            output.append("\n⚠️ No responsive classes — ensure mobile-first design")
        if not focus:
            output.append("\n⚠️ No focus classes — keyboard navigation may not be visible")

        return "\n".join(output)
    except Exception as e:
        return f"ERROR analyzing Tailwind: {e}"
