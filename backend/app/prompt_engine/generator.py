from app.prompt_engine.templates import BASE_TEMPLATE, ROLES, get_complexity_guidelines
from app.prompt_engine.selector import get_rules
from app.prompt_engine.modes import get_ai_control_instruction

def compose_prompt(data: dict) -> str:
    """Merges built intent, rules, and templates into a raw prompt."""
    # Determine Role based on Project Type
    project_type = data['project_type'].lower()
    
    # default to generic
    role = ROLES.get(data['ai_target'], ROLES['generic'])

    if "mobile application" in project_type:
        role = ROLES['mobile']
    elif "react native" in [s.lower() for s in data.get('frontend_stack', [])] or "react native" in project_type:
        role = ROLES['mobile']
    elif "backend api" in project_type:
        role = ROLES['backend']
    elif "web application" in project_type:
        role = ROLES['web']
    
    # Get rules via Condition Engine
    # Get rules via Condition Engine
    rules = get_rules(data['project_type'], data.get('frontend_stack', []))
    technical_standards = "\n".join([f"- {rule}" for rule in rules])
    
    complexity_guidelines = get_complexity_guidelines(data.get('complexity', 'Medium'))
    ai_instructions = get_ai_control_instruction(data.get('ai_control', 'Controlled'))
    

    # Dynamic steps based on complexity
    complexity = data.get('complexity', 'medium').lower()
    print(f"DEBUG: Composer determining headers for complexity: '{complexity}'")
    if complexity == "low":
        goal_header = "## Goal (Simple)"
        tech_stack_header = "## Technology Stack"
        standards_header = "# Technical Standards"
        steps_header = "# Execution Plan"
        steps_text = "1. Setup Project\n2. Implement Core Feature\n3. Basic Testing"
    elif complexity == "high":
        goal_header = "## Comprehensive Goal"
        tech_stack_header = "## Tech Stack & Architecture"
        standards_header = "# Quality Standards & Implementation Guidelines"
        steps_header = "# Implementation Steps (Detailed)"
        steps_text = "1. Architecture Design\n2. Database Schema Design\n3. API Development\n4. Frontend Implementation\n5. Integration Testing\n6. Security Review\n7. Deployment"
    else:
        goal_header = "## Goal"
        tech_stack_header = "## Technology Stack"
        standards_header = "# Technical Standards"
        steps_header = "# Implementation Steps"
        steps_text = "1. Setup Environment\n2. Develop Backend API\n3. Build Frontend UI\n4. Integrate & Test"

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
        goal_header=goal_header,
        goal=data['goal'],
        tech_stack_header=tech_stack_header,
        tech_stack_section=tech_stack_section,
        complexity_guidelines=complexity_guidelines,
        ai_control_instructions=ai_instructions,
        standards_header=standards_header,
        technical_standards=technical_standards or "None",
        steps_header=steps_header,
        steps=steps_text
    ).strip()
