"""
tools/__init__.py
=================
Export all tools organized by agent specialization.
Import from here to keep crew.py clean.
"""

from agents.tools.shared_tools import (
    read_project_file,
    write_project_file,
    list_directory,
    save_report,
    read_latest_report,
    send_message_to_agent,
    read_agent_messages,
)

from agents.tools.frontend_tools import (
    scan_react_components,
    check_nextjs_config,
    audit_page_performance,
    check_accessibility,
    read_package_json,
    find_tailwind_usage,
)

from agents.tools.backend_tools import (
    scan_api_routes,
    analyze_api_handler,
    read_database_schema,
    check_environment_variables,
    audit_npm_dependencies,
    check_api_response_patterns,
)

from agents.tools.security_tools import (
    scan_for_secrets,
    scan_for_xss,
    check_security_headers,
    scan_for_sql_injection,
    check_authentication_setup,
    generate_security_report,
)

from agents.tools.affiliate_tools import (
    research_affiliate_programs_for_category,
    get_affiliate_network_details,
    analyze_category_revenue_potential,
    save_affiliate_research,
    get_affiliate_category_ideas,
    web_search,
    web_scraper,
)

# ── Tool collections per agent ────────────────────────────────────────────────

SHARED_TOOLS = [
    read_project_file,
    write_project_file,
    list_directory,
    save_report,
    read_latest_report,
    send_message_to_agent,
    read_agent_messages,
]

FRONTEND_TOOLS = SHARED_TOOLS + [
    scan_react_components,
    check_nextjs_config,
    audit_page_performance,
    check_accessibility,
    read_package_json,
    find_tailwind_usage,
]

BACKEND_TOOLS = SHARED_TOOLS + [
    scan_api_routes,
    analyze_api_handler,
    read_database_schema,
    check_environment_variables,
    audit_npm_dependencies,
    check_api_response_patterns,
]

SECURITY_TOOLS = SHARED_TOOLS + [
    scan_for_secrets,
    scan_for_xss,
    check_security_headers,
    scan_for_sql_injection,
    check_authentication_setup,
    generate_security_report,
    # Security agent can also read from other agents' reports
    read_latest_report,
]

AFFILIATE_TOOLS = SHARED_TOOLS + [
    research_affiliate_programs_for_category,
    get_affiliate_network_details,
    analyze_category_revenue_potential,
    save_affiliate_research,
    get_affiliate_category_ideas,
    web_search,    # 🌐 Web search superpower
    web_scraper,   # 🌐 Web scraping superpower
]

TEAM_LEADER_TOOLS = SHARED_TOOLS + [
    # Team leader can read all agent reports
    read_latest_report,
    # Web search for strategic intelligence
    web_search,
]
