def build_intent(input_data: dict) -> dict:
    """
    Standardizes raw input data for the engine.
    Previously 'normalize'.
    """
    return {
        "goal": input_data.get("goal", "").strip() or input_data.get("additionalInstructions", "").strip(),
        "project_title": (input_data.get("project_title", "") or input_data.get("title", "Untitled Project")).strip(),
        "frontend_stack": [s.strip() for s in input_data.get("frontendStack", []) if s],
        "frontend_styling": [s.strip() for s in input_data.get("frontendStyling", []) if s],
        "mobile_stack": [s.strip() for s in input_data.get("mobileStack", []) if s],
        "backend_stack": [s.strip() for s in input_data.get("backendStack", []) if s],
        "database": input_data.get("database", "None").strip(),
        "auth": [s.strip() for s in input_data.get("auth", []) if s],
        "api": [s.strip() for s in input_data.get("api", []) if s],
        "dev_ops": [s.strip() for s in input_data.get("devOps", []) if s],
        "ai_target": input_data.get("ai_target", "generic").strip().lower(),
        "project_type": (input_data.get("project_type", "") or input_data.get("type", "general")).strip().lower(),
        "complexity": input_data.get("complexity", "medium").strip().lower(),
        "ai_control": input_data.get("ai_control", "Controlled").strip()
    }
