BASE_TEMPLATE = """
# Role
{role}

# AI Control Mode
{ai_control_instructions}

# Complexity Guidelines
{complexity_guidelines}

# Project Context
## Title
{project_title}

{goal_header}
{goal}

## Type
{project_type}

{tech_stack_header}
- Frontend: {frontend_stack}
- Backend: {backend_stack}
- Database: {database}

# Critical Instructions for Implementation
1. **Code Quality**: Write clean, maintainable, and production-ready code. Follow DRY (Don't Repeat Yourself) and SOLID principles.
2. **Modularity**: Break down complex logic into small, reusable functions or components.
3. **Error Handling**: Implement robust error handling (try/catch blocks, distinct error types) and input validation.
4. **Security**: Ensure no sensitive data is exposed. Use environment variables for secrets. Validate all user inputs.
5. **Comments**: Add meaningful comments for complex logic, but avoid stating the obvious.
6. **Modern Standards**: Use the latest stable features of the selected languages/frameworks (e.g., React Hooks, ES6+, Python 3.10+ types).

{standards_header}
{technical_standards}

{steps_header}
{steps}
"""

ROLES = {

    "generic": "Expert Full-Stack Software Engineer",
    "mobile": "Senior Mobile Application Architect (iOS & Android)",
    "backend": "Senior Backend Systems Engineer & API Specialist",
    "web": "Modern Web Application Architect (React/Next.js/Vue)"
}
