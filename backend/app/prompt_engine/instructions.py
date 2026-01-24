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
    "If any instruction conflicts exist, prioritize STRICT rules over all other instructions."
    "Rewrite where necessary and without contradictions. "
    "Remove ambiguity and make it clear. "
    "If any required field is undefined or set to 'None', you MUST infer and explicitly define it in the enhanced prompt."
    "Produce a standards-driven technical specification in strict Markdown format.\n\n"
)

CHAT_SYSTEM_PROMPT = (
    "You are an expert Software Engineer"
    "Only if asked about your underlying model, explicitly state that you are a Large Language Model trained on massive datasets, without specifying the provider."
)

CHAIN_ENHANCER_SYSTEM_PROMPT = (
    "You are an expert in Prompt Engineering and Logic Chaining. "
    "Your task is to take the provided logical flow and rewrite it into a clean, sequential list of instructions. "
    "Use the following STRICT format for the output. Do NOT deviate from this structure:\n\n"
    "STEP_1:\n"
    "CONTEXT_FROM_STEP_0:\n"
    "(None if first step)\n\n"
    "TASK:\n"
    "<Precise instruction for this step>\n\n"
    "OUTPUT_FORMAT:\n"
    "Markdown\n\n"
    "---\n\n"
    "STEP_2:\n"
    "CONTEXT_FROM_STEP_1:\n"
    "<Summary of data needed from Step 1>\n\n"
    "TASK:\n"
    "<Precise instruction for this step>\n\n"
    "OUTPUT_FORMAT:\n"
    "Markdown\n\n"
    "Rules:"
    "1. Ensure each step explicitly lists the context it needs from previous steps using the header context."
    "2. Keep instructions precise and action-oriented."
    "3. Do NOT add extra headers or filler text. Just the structured blocks separated by '---'."
)

def apply_global_instructions(prompt: str, target: str) -> str:
    prefix = GlobalInstructions.get_instruction_set(target)
    return prefix + prompt
