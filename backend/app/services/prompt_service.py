from app.prompt_engine.builder import build_intent
from app.prompt_engine.generator import compose_prompt

async def create_prompt(input_data: dict) -> str:

    """
    Orchestrates the prompt generation flow:
    1. Build Intent (Normalize)
    2. Compose Prompt (Apply Rules & Templates)
    """
    # 1. Build Intent
    intent_data = build_intent(input_data)
    
    # 2. Compose
    raw_prompt = compose_prompt(intent_data)
    
    # 3. Apply Global Instructions (Global instructions removed, passing raw_prompt directly)
    final_prompt = raw_prompt

    # 4. Enhance with LLM (Optional)
    if input_data.get('enhance_prompt', True):
        from app.services.llm_service import llm_service
        # Enhance prompt with LLM
        model_id = input_data.get('model')
        enhanced_prompt = await llm_service.enhance_prompt(final_prompt, model_id=model_id)
        return enhanced_prompt
    
    print("Optimization SKIPPED. Returning raw base template output.")
    return final_prompt
