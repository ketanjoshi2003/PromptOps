
import pytest
from app.prompt_engine.builder import build_intent
from app.prompt_engine.modes import get_ai_control_instruction, AI_CONTROL_PROMPTS
from app.prompt_engine.generator import compose_prompt

# --- Tests for builder.py ---

def test_build_intent_with_full_data():
    raw_data = {
        "goal": "Build a todo app",
        "title": "Todo Master",
        "frontendStack": ["React", "Vite"],
        "frontendStyling": ["Tailwind"],
        "database": "PostgreSQL",
        "ai_control": "Strict"
    }
    
    result = build_intent(raw_data)
    
    assert result["goal"] == "Build a todo app"
    assert result["project_title"] == "Todo Master"
    assert "React" in result["frontend_stack"]
    assert "Vite" in result["frontend_stack"]
    assert result["database"] == "PostgreSQL"
    assert result["ai_control"] == "Strict"

def test_build_intent_defaults():
    raw_data = {}
    result = build_intent(raw_data)
    
    assert result["project_title"] == "Untitled Project"
    assert result["ai_target"] == "generic"

# --- Tests for modes.py ---

def test_get_ai_control_instruction_valid():
    instruction = get_ai_control_instruction("Controlled")
    assert instruction == AI_CONTROL_PROMPTS["Controlled"]

def test_get_ai_control_instruction_case_insensitive():
    # The current implementation capitalizes the input: "strict" -> "Strict"
    instruction = get_ai_control_instruction("balanced")
    assert instruction == AI_CONTROL_PROMPTS["Balanced"]

def test_get_ai_control_instruction_default():
    instruction = get_ai_control_instruction("NonExistentMode")
    # Default is Controlled
    assert instruction == AI_CONTROL_PROMPTS["Controlled"]

# --- Tests for generator.py ---

def test_compose_prompt_integration():
    data = {
        "project_type": "Web Application",
        "ai_target": "developer",
        "ai_control": "Controlled",
        "frontend_stack": ["React"],
        "frontend_styling": ["CSS"],
        "mobile_stack": [],
        "backend_stack": ["FastAPI"],
        "database": "PostgreSQL",
        "auth": [],
        "api": [],
        "dev_ops": [],
        "project_title": "Test App",
        "goal": "Test Goal" 
    }
    
    prompt = compose_prompt(data)
    
    # Check for presence of key sections
    assert "## Comprehensive Goal" in prompt
    assert "FastAPI" in prompt
    assert "Test Goal" in prompt
    assert "AI CONTROL MODE: CONTROLLED" in prompt

def test_compose_prompt_low_complexity():
    data = {
        "project_type": "Web Application",
        "ai_target": "developer",
        "ai_control": "Balanced",
        "frontend_stack": [],
        "frontend_styling": [],
        "mobile_stack": [],
        "backend_stack": [],
        "database": "None",
        "auth": [],
        "api": [],
        "dev_ops": [],
        "project_title": "Simple App",
        "goal": "Simple Goal" 
    }
    
    prompt = compose_prompt(data)
    
    assert "## Comprehensive Goal" in prompt
    assert "AI CONTROL MODE: BALANCED" in prompt
