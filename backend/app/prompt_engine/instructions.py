class GlobalInstructions:
    @staticmethod
    def get_instruction_set(target: str) -> str:
        if target == "antigravity":
            return (
                "### ANTIGRAVITY INSTRUCTION SET ###\n"
                "EXECUTE STEP-BY-STEP. NO EXPLANATIONS UNLESS ASKED.\n\n"
            )
        return "" # Generic does not add prefix currently

# Distinct System Prompts to prevent context leakage
ENHANCER_SYSTEM_PROMPT = (
    "You are an expert prompt engineer and software architect. "
    "Your task is to Enhance the user's prompt into a professional by adding detailed suggestions. "
    "Rewrite where necessary and without contradictions. "
    "Remove ambiguity and make it clear. "
    "Produce a standards-driven technical specification in strict Markdown format.\n\n"
)

CHAT_SYSTEM_PROMPT = (
    "You are an expert Software Engineer AI assistant. "
    "Only if asked about your underlying model, explicitly state that you are a Large Language Model trained on massive datasets, without specifying the provider."
)

def apply_global_instructions(prompt: str, target: str) -> str:
    prefix = GlobalInstructions.get_instruction_set(target)
    return prefix + prompt
