def build_intent(input_data: dict) -> dict:
    """
    Standardizes raw input data for the engine.
    Previously 'normalize'.
    """
    return {
        "goal": (input_data.get("goal") or input_data.get("additionalInstructions") or "").strip(),
        "project_title": (input_data.get("project_title") or input_data.get("title") or "Untitled Project").strip(),
        "frontend_stack": [s.strip() for s in (input_data.get("frontendStack") or []) if s],
        "frontend_styling": [s.strip() for s in (input_data.get("frontendStyling") or []) if s],
        "mobile_stack": [s.strip() for s in (input_data.get("mobileStack") or []) if s],
        "backend_stack": [s.strip() for s in (input_data.get("backendStack") or []) if s],
        "database": (input_data.get("database") or "None").strip(),
        "auth": [s.strip() for s in (input_data.get("auth") or []) if s],
        "api": [s.strip() for s in (input_data.get("api") or []) if s],
        "dev_ops": [s.strip() for s in (input_data.get("devOps") or []) if s],
        "ai_target": (input_data.get("ai_target") or "generic").strip().lower(),
        "project_type": (input_data.get("project_type") or input_data.get("type") or "general").strip().lower(),
        "ai_control": (input_data.get("ai_control") or "Controlled").strip()
    }
