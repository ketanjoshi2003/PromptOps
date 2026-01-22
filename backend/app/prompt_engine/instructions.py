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
    "If any required field is undefined or set to 'None', you MUST infer and explicitly define it in the enhanced prompt."
)

CHAT_SYSTEM_PROMPT = (
    "You are an expert Software Engineer AI assistant. "
    "Only if asked about your underlying model, explicitly state that you are a Large Language Model trained on massive datasets, without specifying the provider."
)

CHAIN_ENHANCER_SYSTEM_PROMPT = (
    "You are an expert in Prompt Engineering and Logic Chaining. "
    "Your task is to take the provided logical flow and rewrite it into a clean, sequential list of instructions. "
    "Use the following STRICT format for the output:\n\n"
    "Step 1:\n"
    "<Optimized Instruction for Step 1>\n\n"
    "Step 2:\n"
    "<Optimized Instruction for Step 2>\n\n"
    "Rules:"
    "1. Ensure each step explicitly states what data it uses from previous steps."
    "2. Keep instructions precise and action-oriented."
    "3. Do NOT add extra headers, roles, or filler text. Just the Steps."
)

def apply_global_instructions(prompt: str, target: str) -> str:
    prefix = GlobalInstructions.get_instruction_set(target)
    return prefix + prompt
