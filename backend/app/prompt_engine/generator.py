from app.prompt_engine.templates import BASE_TEMPLATE, ROLES
from app.prompt_engine.selector import get_rules
from app.prompt_engine.modes import get_ai_control_instruction

def compose_prompt(data: dict) -> str:
    """Merges built intent, rules, and templates into a raw prompt."""
    # Determine Role based on Project Type
    project_type = data['project_type'].lower()
    
    # default to generic
    role = ROLES.get(data['ai_target'], ROLES['generic'])

    if "mobile app" in project_type or "mobile application" in project_type:
        role = ROLES['mobile']
    elif "react native" in [s.lower() for s in data.get('frontend_stack', [])] or "react native" in project_type:
        role = ROLES['mobile']
    elif "backend api" in project_type:
        role = ROLES['backend']
    elif "web app" in project_type or "web application" in project_type:
        role = ROLES['web']
    
    # Get rules via Condition Engine
    # Get rules via Condition Engine
    rules = get_rules(data['project_type'], data.get('frontend_stack', []))
    technical_standards = "\n".join([f"- {rule}" for rule in rules])

    ai_instructions = get_ai_control_instruction(data.get('ai_control', 'Controlled'))

    # Build Tech Stack Section Dynamically
    stack_items = [
        ("Frontend", ", ".join(data['frontend_stack'])),
        ("Styling", ", ".join(data['frontend_styling'])),
        ("Mobile", ", ".join(data['mobile_stack'])),
        ("Backend", ", ".join(data['backend_stack'])),
        ("Database", data['database']),
        ("Auth", ", ".join(data['auth'])),
        ("API/Protocol", ", ".join(data['api'])),
        ("Dev & Quality", ", ".join(data['dev_ops'])),
    ]

    # Filter out empty or "None" values
    tech_stack_lines = []
    for label, value in stack_items:
        if value and value.lower() != "none" and value.strip() != "":
            tech_stack_lines.append(f"- {label}: {value}")
    
    # Fallback if everything is empty
    if not tech_stack_lines:
        tech_stack_lines.append("- None specified")
    
    tech_stack_section = "\n".join(tech_stack_lines)

    return BASE_TEMPLATE.format(
        role=role,
        project_title=data['project_title'],
        project_type=data['project_type'],
        goal=data['goal'],
        tech_stack_section=tech_stack_section,
        ai_control_instructions=ai_instructions,
        technical_standards=technical_standards or "None"
    ).strip()
