from .base_template import BASE_TEMPLATE, ROLES, OUTPUT_EXPECTATIONS


def get_complexity_guidelines(complexity: str) -> str:
    """Returns prompt guidelines based on complexity level."""
    complexity = complexity.lower()
    if complexity == "low":
        return (
            "GUIDELINES (LOW COMPLEXITY):\n"
            "1. Keep the scope MINIMAL and simple. Focus on a working prototype.\n"
            "2. Output ONLY the enhanced prompt. No filler.\n"
            "3. Structure:\n"
            "   # Role\n"
            "   # AI Control Mode\n"
            "   # Project Title\n"
            "   ## Goal (Simple)\n"
            "   ## Tech Stack\n"
            "   ## Core Features (Basic only)\n"
            "   ## Steps (High-level)\n"
            "4. Avoid over-engineering. Use simple, straightforward patterns."
        )
    elif complexity == "medium":
        return (
            "GUIDELINES (MEDIUM COMPLEXITY):\n"
            "1. Balance structure with flexibility. Standard professional scope.\n"
            "2. Output ONLY the enhanced prompt. No filler.\n"
            "3. Structure:\n"
            "   # Role\n"
            "   # AI Control Mode\n"
            "   # Project Title\n"
            "   ## Goal\n"
            "   ## Tech Stack\n"
            "   ## Core Features\n"
            "   ## Implementation Steps\n"
            "4. Be precise and actionable."
        )
    else: # High
        return (
            "GUIDELINES (HIGH COMPLEXITY):\n"
            "1. Detailed, enterprise-grade specification. Focus on scalability and robustness.\n"
            "2. Output ONLY the enhanced prompt. No filler.\n"
            "3. Structure:\n"
            "   # Role\n"
            "   # AI Control Mode\n"
            "   # Project Title\n"
            "   ## Comprehensive Goal\n"
            "   ## Tech Stack & Architecture\n"
            "   ## Detailed Features\n"
            "   ## Implementation Steps (Detailed)\n"
            "   ## Quality Standards (Testing, Security)\n"
            "4. Be extremely precise, removing all ambiguity."
        )
