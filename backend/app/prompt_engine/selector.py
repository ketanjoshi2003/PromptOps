from app.prompt_engine.rules import (
    WEB_RULES, BACKEND_RULES, GENERAL_RULES, 
    ANDROID_RULES, ANDROID_KEYWORDS
)

RULES_MAP = {
    "backend": BACKEND_RULES,
    "frontend": WEB_RULES,
    "general": GENERAL_RULES,
    # "mobile application" key isn't explicitly in the old dict, 
    # but the old code did `if project_type in RULES`.
    # I should ensure mapping works. The old code had 'backend', 'frontend', 'general'.
    # I will map 'mobile application' to general + android potentially? 
    # Actually old code only had 'backend', 'frontend', 'general'.
    # But `composer.py` calls `get_rules(project_type)`. If project_type is "mobile application", it wouldn't match.
    # However, the stack check handles Android.
}

def get_rules(project_type: str, stack: list = None) -> list:
    """Retrieves engineering rules based on project type and tech stack."""
    rules = list(GENERAL_RULES)
    
    # Map project types to rule sets
    normalized_type = project_type.lower()
    if "backend" in normalized_type:
        rules.extend(BACKEND_RULES)
    elif "frontend" in normalized_type or "web" in normalized_type:
        rules.extend(WEB_RULES)
    
    # Dynamic rules based on usage (e.g. Android tech in Mobile App)
    if stack:
        if any(keyword in stack for keyword in ANDROID_KEYWORDS):
            rules.extend(ANDROID_RULES)
            
    return rules
