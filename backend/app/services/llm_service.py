from typing import Optional, List, Dict, Any
import google.generativeai as genai
from openai import OpenAI
from groq import Groq
from app.config.settings import settings
from app.prompt_engine.templates import get_complexity_guidelines, BASE_TEMPLATE
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
            self.openai_client = self._init_client("OpenAI", OpenAI, self.openai_key)

        # Initialize Groq
        if self.groq_key:
            self.groq_client = self._init_client("Groq", Groq, self.groq_key)

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
        # Simple heuristic: if it looks like an API key (sk-...), mask it
        if "sk-" in err_str:
            # Mask typical OpenAI keys
            import re
            err_str = re.sub(r"sk-[a-zA-Z0-9]{20,}", "sk-********************", err_str)
        # Add more specific masking if needed for other providers
        return err_str

    def enhance_prompt(self, content: str, complexity: str = "Medium", is_chain: bool = False) -> str:
        """
        Enhances the generated prompt using available LLMs with failover.
        """
        providers = self._get_providers()
        if not providers:
            return content

        # Select Base Instruction
        # Select Base Instruction and Context
        if is_chain:
            base_instruction = CHAIN_ENHANCER_SYSTEM_PROMPT
            template_context = "" 
            # Chains have their own structure defined in the system prompt
            guidelines = "" 
        else:
            base_instruction = ENHANCER_SYSTEM_PROMPT
            template_context = f"\n\nHere is the BASE TEMPLATE that defines the required structure, rules, and conditions:\n{BASE_TEMPLATE}\n\n"
            guidelines = get_complexity_guidelines(complexity)
        
        system_instruction = base_instruction + template_context + guidelines
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
                
                result = self._chat_with_provider(provider, messages)
                print(f"DEBUG: {provider} returned: {result[:100] if result else 'EMPTY LINK/NONE'}")
                return result

            except Exception as e:
                print(f"Error with {provider}: {e}")
                errors.append(f"{provider}: {self._sanitize_error(e)}")
                continue # Try next provider

        print("All providers failed for enhance_prompt.")
        return f"Error reporting: All providers failed. Details: {' | '.join(errors)}"

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """
        Handles a general chat conversation with failover.
        """
        providers = self._get_providers()
        if not providers:
             return "Error: AI Service is not configured. Please check your API keys."

        errors = []

        for provider in providers:
            try:
                print(f"Attempting chat with {provider}...")
                return self._chat_with_provider(provider, messages)
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

    def _chat_with_provider(self, provider: str, messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """
        Internal method to execute chat with a specific provider.
        """
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
            
            # Add system prompt as user message (common workaround) or using 1.5 features
            # Simple prepend approach:
            current_history.append({"role": "user", "parts": [f"System: {system_prompt}"]})
            
            # Map messages
            for msg in messages[start_index:]:
                role = "user" if msg['role'] == 'user' else "model"
                current_history.append({"role": role, "parts": [msg['content']]})
            
            # Ensure history alternates correctly. If logic above failed, simple fix:
            # (Gemini strictness might require more robust handling, but this is a decent start)
            
            response = self.gemini_model.generate_content(current_history)
            return response.text

        elif provider == 'openai':
            openai_messages = [{"role": "system", "content": system_prompt}]
            openai_messages.extend(messages[start_index:])
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=openai_messages,
                temperature=0.7
            )
            return response.choices[0].message.content

        elif provider == 'groq':
            groq_messages = [{"role": "system", "content": system_prompt}]
            groq_messages.extend(messages[start_index:])
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=groq_messages,
                temperature=0.7
            )
            return response.choices[0].message.content
            
        raise ValueError(f"Unknown provider: {provider}")

llm_service = LLMService()
