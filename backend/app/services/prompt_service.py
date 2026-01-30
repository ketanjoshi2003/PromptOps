from app.prompt_engine.builder import build_intent
from app.prompt_engine.generator import compose_prompt
from app.prompt_engine.instructions import apply_global_instructions

async def create_prompt(input_data: dict) -> str:
    """
    Orchestrates the prompt generation flow:
    1. Build Intent (Normalize)
    2. Compose Prompt (Apply Rules & Templates)
    3. Apply Global Instructions (Adapters)
    """
    # 1. Build Intent
    intent_data = build_intent(input_data)
    
    # 2. Compose
    raw_prompt = compose_prompt(intent_data)
    
    # 3. Apply Global Instructions
    final_prompt = apply_global_instructions(raw_prompt, intent_data['ai_target'])
    
    # 4. Enhance with LLM (Optional)
    if input_data.get('enhance_prompt', True):
        from app.services.llm_service import llm_service
        # Pass complexity to enhance_prompt
        enhanced_prompt = await llm_service.enhance_prompt(final_prompt)
        return enhanced_prompt
    
    print("Optimization SKIPPED. Returning raw base template output.")
    return final_prompt
