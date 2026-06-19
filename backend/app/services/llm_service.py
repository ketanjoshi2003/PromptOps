from typing import Optional, List, Dict, Any
import google.generativeai as genai
from openai import OpenAI
from groq import Groq
from app.config.settings import settings
from app.prompt_engine.templates import BASE_TEMPLATE
from app.prompt_engine.instructions import ENHANCER_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, CHAIN_ENHANCER_SYSTEM_PROMPT

class LLMService:
    def __init__(self):
        self.preferred_provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GOOGLE_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.gemini_model = None
        self.openai_client = None
        self.groq_client = None
        self._initialize_providers()

    def _initialize_providers(self):
        """Initializes all available LLM providers with error handling."""
        # Initialize Gemini
        if self.gemini_key:
            self._init_gemini()

        # Initialize OpenAI
        if self.openai_key:
            from openai import AsyncOpenAI
            self.openai_client = self._init_client("OpenAI", AsyncOpenAI, self.openai_key)

        # Initialize Groq
        if self.groq_key:
            from groq import AsyncGroq
            self.groq_client = self._init_client("Groq", AsyncGroq, self.groq_key)

    def _init_gemini(self):
        """Helper to safely initialize Gemini."""
        try:
            masked = self._mask_key(self.gemini_key)
            print(f"Initializing Gemini... (Key ends in {masked})")
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        except Exception as e:
            print(f"Failed to initialize Gemini: {e}")

    def _init_client(self, name: str, client_cls: Any, key: str) -> Any:
        """Generic helper to initialize OpenAI/Groq clients."""
        try:
            masked = self._mask_key(key)
            print(f"Initializing {name}... (Key ends in {masked})")
            return client_cls(api_key=key)
        except Exception as e:
            print(f"Failed to initialize {name}: {e}")
            return None

    def _mask_key(self, key: str) -> str:
        """Returns the last 4 chars of the key or ****."""
        return key[-4:] if key and len(key) > 4 else "****"

    def _get_providers(self) -> List[str]:
        """
        Returns a list of provider names to try, in order of priority.
        """
        providers = []
        
        # Determine primary based on settings or defaults
        primary = self.preferred_provider
        
        # If primary is specified and available, add it first
        if primary == 'gemini' and self.gemini_model:
            providers.append('gemini')
        elif primary == 'openai' and self.openai_client:
            providers.append('openai')
        elif primary == 'groq' and self.groq_client:
            providers.append('groq')
            
        # Add others if available and not already added
        if self.gemini_model and 'gemini' not in providers:
            providers.append('gemini')
        if self.openai_client and 'openai' not in providers:
            providers.append('openai')
        if self.groq_client and 'groq' not in providers:
            providers.append('groq')
            
        return providers

    def _sanitize_error(self, error: Exception) -> str:
        """
        Sanitizes error messages to remove sensitive information like API keys.
        """
        err_str = str(error)
        import re
        # Mask typical OpenAI keys (sk-...)
        if "sk-" in err_str:
            err_str = re.sub(r"sk-[a-zA-Z0-9]{20,}", "sk-********************", err_str)
        # Mask typical Google/Gemini keys (AIza...)
        if "AIza" in err_str:
            err_str = re.sub(r"AIza[a-zA-Z0-9_-]{35,}", "AIza********************", err_str)
        
        return err_str

    async def enhance_prompt(self, content: str, is_chain: bool = False, model_id: Optional[str] = None) -> str:
        """
        Enhances the generated prompt using available LLMs with failover (Async).
        """
        providers = self._get_providers()
        if not providers:
            return content

        # Select Base Instruction
        if is_chain:
            base_instruction = CHAIN_ENHANCER_SYSTEM_PROMPT
            template_context = "" 
            guidelines = "" 
        else:
            base_instruction = ENHANCER_SYSTEM_PROMPT
            template_context = f"\n\nHere is the BASE TEMPLATE that defines the required structure, rules, and conditions:\n{BASE_TEMPLATE}\n\n"
            # guidelines removed to avoid structural conflict
        
        system_instruction = base_instruction + template_context
        user_message = f"Please enhance the following project prompt/chain to be more professional and detailed:\n\n{content}"

        errors = []

        for provider in providers:
            try:
                print(f"Attempting enhance_prompt with {provider}...")
                
                # Construct messages
                messages = [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_message}
                ]
                
                result = await self._chat_with_provider(provider, messages, model_id=model_id if provider == 'groq' else None)
                print(f"DEBUG: {provider} returned: {result[:100] if result else 'EMPTY LINK/NONE'}")
                return result

            except Exception as e:
                print(f"Error with {provider}: {e}")
                errors.append(f"{provider}: {self._sanitize_error(e)}")
                continue # Try next provider

        print("All providers failed for enhance_prompt.")
        return f"Error reporting: All providers failed. Details: {' | '.join(errors)}"

    async def chat(self, messages: List[Dict[str, str]], model_id: Optional[str] = None) -> str:
        """
        Handles a general chat conversation with failover (Async).
        """
        providers = self._get_providers()
        if not providers:
             return "Error: AI Service is not configured. Please check your API keys."

        errors = []

        for provider in providers:
            try:
                print(f"Attempting chat with {provider}...")
                return await self._chat_with_provider(provider, messages, model_id=model_id)
            except Exception as e:
                print(f"Error with {provider}: {e}")
                errors.append(f"{provider}: {self._sanitize_error(e)}")
                continue

        # If we get here, all failed
        all_errors_str = " | ".join(errors)
        if "RESOURCE_EXHAUSTED" in all_errors_str or "429" in all_errors_str:
            return (
                "**Usage Limit Reached**\n\n"
                "You have hit the rate limit for all available AI providers. "
                "Please wait a few seconds and try again."
            )
        return f"Error encountered: All providers failed. Details: {all_errors_str}"

    async def _chat_with_provider(self, provider: str, messages: List[Dict[str, str]], system_prompt: Optional[str] = None, model_id: Optional[str] = None) -> str:
        """
        Internal method to execute chat with a specific provider (Async).
        """
        try:
            # Use provided system_prompt or fallback to default global
            if not system_prompt:
                 system_prompt = CHAT_SYSTEM_PROMPT
            
            # Extract system prompt if present in messages (legacy override)
            start_index = 0
            if messages and messages[0]['role'] == 'system':
                # If explicit system message, it overrides everything
                system_prompt = messages[0]['content']
                start_index = 1
    
            if provider == 'gemini':
                # Construct history for Gemini
                current_history = []
                
                # Add system prompt as user message (common workaround)
                current_history.append({"role": "user", "parts": [f"System: {system_prompt}"]})
                
                # Map messages
                for msg in messages[start_index:]:
                    role = "user" if msg['role'] == 'user' else "model"
                    current_history.append({"role": role, "parts": [msg['content']]})
                
                response = await self.gemini_model.generate_content_async(current_history)
                return response.text
    
            elif provider == 'openai':
                openai_messages = [{"role": "system", "content": system_prompt}]
                openai_messages.extend(messages[start_index:])
                
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=openai_messages,
                    temperature=0.7
                )
                return response.choices[0].message.content
    
            elif provider == 'groq':
                groq_messages = [{"role": "system", "content": system_prompt}]
                groq_messages.extend(messages[start_index:])
                
                # Use provided model_id or fallback to default
                selected_model = model_id if model_id else "meta-llama/llama-4-scout-17b-16e-instruct"
                
                response = await self.groq_client.chat.completions.create(
                    model=selected_model,
                    messages=groq_messages,
                    temperature=0.7
                )
                return response.choices[0].message.content
                
            raise ValueError(f"Unknown provider: {provider}")
            
        except Exception as e:
            # Enhanced Error Handling
            error_msg = str(e)
            model_name = model_id if model_id else provider
            
            if "429" in error_msg or "rate limit" in error_msg.lower():
                raise Exception(f"**Rate Limit Exceeded for {model_name}**\n\nThe AI provider is currently busy. Please try again in a moment or select a different model.")
            
            if "401" in error_msg or "invalid api key" in error_msg.lower():
                 raise Exception(f"**Authentication Failed for {provider}**\n\nThe API key provided is invalid or expired. Please check your settings.")

            if "403" in error_msg or "permission" in error_msg.lower() or "blocked" in error_msg.lower():
                 raise Exception(f"**Access Denied: {model_name}**\n\nYour project settings block this model. Please check Allowed Models in your Groq console.")

            if "404" in error_msg or "not found" in error_msg.lower() or "does not exist" in error_msg.lower():
                 raise Exception(f"**Model Unavailable: {model_name}**\n\nThis model is not accessible with your current API key (it might be private or waitlisted). Please try a different model.")
            
            raise e

llm_service = LLMService()
