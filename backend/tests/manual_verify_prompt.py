import sys
import os
import asyncio

# Calculate path to 'backend' directory
current_dir = os.path.dirname(os.path.abspath(__file__)) # .../backend/tests
backend_dir = os.path.abspath(os.path.join(current_dir, "../")) # .../backend

# Add backend_dir to sys.path so 'app' module starts from there
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.prompt_engine.builder import build_intent
from app.services.prompt_service import create_prompt

# Simulate the EXACT dict structure passed from prompt_routes.py to create_prompt -> builder
# Routes passes: snake_case keys for top level, camelCase keys for Lists (as defined in my route map)
mock_route_payload = {
    "goal": "Build a rocket ship",
    "project_title": "SpaceX Clone", # Route passes project_title
    "frontendStack": ["React", "Three.js"],
    "frontendStyling": ["Tailwind"],
    "mobileStack": ["Flutter"],
    "backendStack": ["Go"],
    "database": "Redis",
    "auth": ["OAuth"],
    "api": ["gRPC"],
    "devOps": ["Docker"],
    "ai_target": "generic",
    "project_type": "Full-Stack App", # Route passes project_type
    "complexity": "High",
    "ai_control": "Controlled", # Route passes ai_control
    "enhance_prompt": False
}

async def main():
    try:
        print("Final Test: Comprehensive Data Flow Verification")
        print("-" * 30)
        
        # 1. Test Builder Extraction Logic directly
        print("Testing Builder Extraction...")
        built = build_intent(mock_route_payload)
        
        # Assertions on Builder Output
        assert built["project_title"] == "SpaceX Clone", f"Title Mismatch: {built['project_title']}"
        assert built["project_type"] == "full-stack app", f"Type Mismatch: {built['project_type']}"
        assert built["ai_control"] == "Controlled", f"Control Mismatch: {built['ai_control']}"
        assert "Three.js" in built["frontend_stack"], "Frontend Stack missing"
        assert "Tailwind" in built["frontend_styling"], "Styling missing"
        
        print("✅ Builder Extraction Passed.")
        
        # 2. Test Generator Output via Service
        print("\nTesting Full Prompt Generation...")
        result = await create_prompt(mock_route_payload)
        
        # Assertions on Final Text
        assert "Title\nSpaceX Clone" in result
        assert "Full-Stack App" in result or "full-stack app" in result
        assert "Frontend: React, Three.js" in result
        assert "Styling: Tailwind" in result
        assert "Mobile: Flutter" in result
        assert "Backend: Go" in result
        assert "Database: Redis" in result
        assert "Auth: OAuth" in result
        assert "API/Protocol: gRPC" in result
        assert "Dev & Quality: Docker" in result
        
        print("✅ Prompt Content Generation Passed.")
        print("-" * 30)
        print("\n🎉 ALL SYSTEMS GO. Dynamic data passing is verified.")
        
    except Exception as e:
        print(f"\n❌ VERIFICATION FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
