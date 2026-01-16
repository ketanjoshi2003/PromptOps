def build_intent(input_data: dict) -> dict:
    """
    Standardizes raw input data for the engine.
    Previously 'normalize'.
    """
    return {
        "goal": input_data.get("goal", "").strip(),
        "project_title": input_data.get("project_title", "Untitled Project").strip(),
        "frontend_stack": [s.strip() for s in input_data.get("frontend_stack", []) if s],
        "backend_stack": [s.strip() for s in input_data.get("backend_stack", []) if s],
        "database": input_data.get("database", "None").strip(),
        "ai_target": input_data.get("ai_target", "generic").strip().lower(),
        "project_type": input_data.get("project_type", "general").strip().lower(),
        "complexity": input_data.get("complexity", "medium").strip().lower(),
        "ai_control": input_data.get("ai_control", "Strict").strip()
    }
