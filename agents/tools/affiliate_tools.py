"""
affiliate_tools.py
==================
Superpowers exclusive to the DrawnBuy Affiliate Agent.
Covers affiliate program research, category analysis,
network discovery, and revenue intelligence.
"""

import json
import re
from pathlib import Path
from datetime import datetime
from crewai.tools import tool
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

# ── Built-in CrewAI power tools ───────────────────────────────────────────────
# These are professional-grade tools for web research
web_search = SerperDevTool()
web_scraper = ScrapeWebsiteTool()


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "package.json").exists() or (parent / "next.config.js").exists():
            return parent
    return current.parent.parent.parent


PROJECT_ROOT = _project_root()

# ── Affiliate network knowledge base ─────────────────────────────────────────
AFFILIATE_NETWORKS = {
    "Amazon Associates": {
        "url": "https://affiliate-program.amazon.com",
        "commission": "1-10% (varies by category)",
        "cookie": "24 hours",
        "payment": "Net 60",
        "notes": "Massive product selection, trusted brand, low commissions"
    },
    "ShareASale": {
        "url": "https://www.shareasale.com",
        "commission": "Varies (avg 5-20%)",
        "cookie": "30-90 days typical",
        "payment": "Net 20",
        "notes": "Thousands of merchants, strong in niche categories"
    },
    "CJ Affiliate (Commission Junction)": {
        "url": "https://www.cj.com",
        "commission": "Varies (avg 3-15%)",
        "cookie": "30-60 days typical",
        "payment": "Net 30",
        "notes": "Large brands, reliable tracking, competitive rates"
    },
    "Impact": {
        "url": "https://impact.com",
        "commission": "Varies widely",
        "cookie": "30 days typical",
        "payment": "Net 30",
        "notes": "Modern platform, top-tier brands, excellent reporting"
    },
    "Awin": {
        "url": "https://www.awin.com",
        "commission": "Varies",
        "cookie": "30 days typical",
        "payment": "Net 30",
        "notes": "Strong in Europe, many global brands"
    },
    "Rakuten Advertising": {
        "url": "https://rakutenadvertising.com",
        "commission": "Varies",
        "cookie": "30 days",
        "payment": "Net 30",
        "notes": "Premium brands, strong in fashion/retail"
    },
    "ClickBank": {
        "url": "https://www.clickbank.com",
        "commission": "50-75% (digital products)",
        "cookie": "60 days",
        "payment": "Weekly",
        "notes": "Best for digital products, high commissions"
    }
}


# ── Research tools ────────────────────────────────────────────────────────────

@tool("Research Affiliate Programs for Category")
def research_affiliate_programs_for_category(category: str) -> str:
    """
    Research the best affiliate programs available for a specific product category.
    Returns a structured analysis of top programs with commission rates,
    cookie durations, and recommendations for DrawnBuy.
    category: e.g. 'home decor', 'electronics', 'fashion', 'software tools', 'art supplies'
    """
    try:
        networks_info = []
        for name, info in AFFILIATE_NETWORKS.items():
            networks_info.append(
                f"  **{name}**: {info['commission']} commission, "
                f"{info['cookie']} cookie, {info['payment']} payment. "
                f"{info['notes']}"
            )

        template = f"""
Affiliate Program Research for Category: {category}
====================================================

Top Affiliate Networks to Check for "{category}":
{chr(10).join(networks_info)}

Research Checklist for "{category}" programs:
1. Search ShareASale for "{category}" merchants
2. Search CJ Affiliate for "{category}" brands
3. Search Impact for "{category}" partnerships
4. Check if major brands in "{category}" have direct programs
5. Look for niche-specific networks for "{category}"

Key metrics to compare:
- Commission rate (higher = better)
- Cookie duration (longer = more conversions)
- Average Order Value (higher = more per sale)
- EPC (Earnings Per Click)
- Conversion rate
- Payment reliability and minimum payout

For DrawnBuy specifically, prioritize:
- Programs with visual product catalogs (images/APIs available)
- Programs with data feeds for product listings
- Programs with 30+ day cookies
- Programs with reliable tracking
"""
        return template
    except Exception as e:
        return f"ERROR researching affiliate programs: {e}"


@tool("Get Affiliate Network Details")
def get_affiliate_network_details(network_name: str = "all") -> str:
    """
    Get detailed information about affiliate networks.
    network_name: specific network name or 'all' for complete overview.
    Provides commission structures, payment terms, and join recommendations.
    """
    try:
        if network_name.lower() == "all":
            output = ["📊 Affiliate Networks Overview for DrawnBuy:\n"]
            for name, info in AFFILIATE_NETWORKS.items():
                output.append(f"**{name}**")
                output.append(f"  🌐 {info['url']}")
                output.append(f"  💰 Commission: {info['commission']}")
                output.append(f"  🍪 Cookie: {info['cookie']}")
                output.append(f"  💳 Payment: {info['payment']}")
                output.append(f"  📝 {info['notes']}")
                output.append("")
            return "\n".join(output)

        # Find specific network
        for name, info in AFFILIATE_NETWORKS.items():
            if network_name.lower() in name.lower():
                return f"""**{name}**
URL: {info['url']}
Commission: {info['commission']}
Cookie Duration: {info['cookie']}
Payment Terms: {info['payment']}
Notes: {info['notes']}"""

        return f"Network '{network_name}' not found. Available: {', '.join(AFFILIATE_NETWORKS.keys())}"
    except Exception as e:
        return f"ERROR: {e}"


@tool("Analyze Category Revenue Potential")
def analyze_category_revenue_potential(category: str, monthly_visitors: int = 1000) -> str:
    """
    Estimate the revenue potential of a product category for DrawnBuy.
    Calculates projected affiliate revenue based on typical conversion rates
    and commission structures.
    category: product category name
    monthly_visitors: estimated monthly visitors to that category page (default 1000)
    """
    try:
        # Industry average benchmarks for affiliate sites
        benchmarks = {
            "electronics": {"ctr": 0.04, "conversion": 0.025, "aov": 150, "commission": 0.04},
            "home decor": {"ctr": 0.06, "conversion": 0.035, "aov": 80, "commission": 0.08},
            "fashion": {"ctr": 0.05, "conversion": 0.03, "aov": 65, "commission": 0.10},
            "art supplies": {"ctr": 0.07, "conversion": 0.04, "aov": 45, "commission": 0.08},
            "software": {"ctr": 0.05, "conversion": 0.02, "aov": 30, "commission": 0.30},
            "books": {"ctr": 0.06, "conversion": 0.05, "aov": 25, "commission": 0.045},
            "fitness": {"ctr": 0.05, "conversion": 0.03, "aov": 75, "commission": 0.08},
            "digital products": {"ctr": 0.06, "conversion": 0.03, "aov": 50, "commission": 0.50},
        }

        # Find closest matching category
        cat_lower = category.lower()
        metrics = benchmarks.get("home decor")  # default
        for key, vals in benchmarks.items():
            if key in cat_lower or any(word in cat_lower for word in key.split()):
                metrics = vals
                break

        # Calculate
        clicks = monthly_visitors * metrics["ctr"]
        conversions = clicks * metrics["conversion"]
        revenue = conversions * metrics["aov"] * metrics["commission"]

        output = f"""📈 Revenue Potential Analysis: {category}

Assumptions (industry benchmarks):
  Monthly Visitors: {monthly_visitors:,}
  Click-Through Rate: {metrics['ctr']*100:.1f}%
  Conversion Rate: {metrics['conversion']*100:.1f}%
  Average Order Value: ${metrics['aov']}
  Average Commission Rate: {metrics['commission']*100:.0f}%

Projections:
  Monthly Clicks: ~{clicks:.0f}
  Monthly Conversions: ~{conversions:.1f}
  Monthly Revenue: ~${revenue:.2f}
  Annual Revenue: ~${revenue*12:.2f}

To improve these numbers:
  ✅ Optimize product placement and descriptions
  ✅ Use high-quality product images
  ✅ Add comparison tables
  ✅ Write detailed product reviews
  ✅ Target long-tail search keywords
  ✅ Build email list for repeat traffic

Note: These are estimates. Actual results depend on traffic quality,
content quality, and the specific affiliate programs used.
"""
        return output
    except Exception as e:
        return f"ERROR analyzing revenue potential: {e}"


@tool("Save Affiliate Research Report")
def save_affiliate_research(category: str, research_content: str) -> str:
    """
    Save affiliate research findings to the reports directory.
    category: the category that was researched
    research_content: the full research findings in Markdown format
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        reports_dir = PROJECT_ROOT / "agents" / "reports" / "affiliate"
        reports_dir.mkdir(parents=True, exist_ok=True)

        safe_category = re.sub(r"[^a-z0-9_]", "_", category.lower())
        filename = f"affiliate_{safe_category}_{timestamp}.md"
        filepath = reports_dir / filename

        header = f"# Affiliate Research: {category}\n\n"
        header += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n---\n\n"

        filepath.write_text(header + research_content, encoding="utf-8")
        return f"✅ Affiliate research saved to: agents/reports/affiliate/{filename}"
    except Exception as e:
        return f"ERROR saving research: {e}"


@tool("Get Affiliate Category Ideas")
def get_affiliate_category_ideas() -> str:
    """
    Get a curated list of high-potential affiliate product categories
    specifically suited for DrawnBuy's audience (design/creative focus).
    Returns categories ranked by revenue potential and audience fit.
    """
    categories = [
        {
            "name": "Art & Drawing Supplies",
            "potential": "⭐⭐⭐⭐⭐",
            "why": "Core audience match — artists and designers",
            "top_networks": "Amazon Associates, Blick Art Materials, Dick Blick",
            "avg_commission": "5-10%"
        },
        {
            "name": "Digital Design Tools & Software",
            "potential": "⭐⭐⭐⭐⭐",
            "why": "High AOV, recurring subscriptions, perfect for design community",
            "top_networks": "Adobe (direct), Canva, Figma, Impact",
            "avg_commission": "15-30%"
        },
        {
            "name": "Graphic Tablets & Styluses",
            "potential": "⭐⭐⭐⭐",
            "why": "High ticket items, strong audience alignment",
            "top_networks": "Amazon, Wacom (direct), B&H Photo",
            "avg_commission": "4-8%"
        },
        {
            "name": "Print-on-Demand Services",
            "potential": "⭐⭐⭐⭐",
            "why": "Artists love selling their work, high relevance",
            "top_networks": "Printful, Printify, Redbubble",
            "avg_commission": "10-20%"
        },
        {
            "name": "Online Course Platforms",
            "potential": "⭐⭐⭐⭐⭐",
            "why": "Design courses, high commissions, growing market",
            "top_networks": "Skillshare, Udemy, CreativeLive",
            "avg_commission": "20-45%"
        },
        {
            "name": "Framing & Wall Art Services",
            "potential": "⭐⭐⭐⭐",
            "why": "Natural extension of drawing/art content",
            "top_networks": "Framebridge, Minted, Society6",
            "avg_commission": "8-15%"
        },
        {
            "name": "Photography Equipment",
            "potential": "⭐⭐⭐⭐",
            "why": "Creative overlap, high AOV",
            "top_networks": "Amazon, Adorama, B&H Photo",
            "avg_commission": "3-8%"
        },
        {
            "name": "Ergonomic Workspace Products",
            "potential": "⭐⭐⭐",
            "why": "Artists/designers care about workspace setup",
            "top_networks": "Amazon, Flexispot, Autonomous",
            "avg_commission": "5-12%"
        },
    ]

    output = ["🎯 High-Potential Affiliate Categories for DrawnBuy:\n"]
    for i, cat in enumerate(categories, 1):
        output.append(f"{i}. **{cat['name']}** {cat['potential']}")
        output.append(f"   Why it fits: {cat['why']}")
        output.append(f"   Top networks: {cat['top_networks']}")
        output.append(f"   Average commission: {cat['avg_commission']}")
        output.append("")

    output.append("💡 Recommendation: Start with Digital Design Tools and Art Supplies")
    output.append("   as these have the highest audience alignment and commission rates.")

    return "\n".join(output)
