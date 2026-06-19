# PromptOps

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688)
![License](https://img.shields.io/badge/License-MIT-green)

**PromptOps** is a specialized prompt engineering platform designed to supercharge AI-assisted software development. It generates context-rich, high-level prompts optimized for AI-native IDEs like **Antigravity**, **Cursor**, **Blackbox**, and **Claude Dev**.

By structuring requirements into token-efficient, comprehensive instructions, PromptOps enables developers to build MVPs faster with significantly reduced back-and-forth iteration.

## 🚀 Why PromptOps?

- **✨ High-Level Prompt Generation**: Transforms abstract ideas into detailed, architectural-level prompts that AI agents understand immediately.
- **📉 Token Efficiency**: Optimized prompt structures maximize context window value, reducing API costs and "memory loss" in long sessions.
- **🏎️ Accelerated MVP Creation**: Designed to facilitate "one-shot" scaffolding of complex features or entire applications.
- **🔄 Reduced Iteration**: Minimizes the "sorry, I misunderstood" loop by providing clear, unambiguous technical constraints upfront.

## 🛠️ Key Features

- **Multi-Model Orchestration**: Compare outputs from Gemini, OpenAI, and Groq to find the best phrasing for your AI coder.
- **IDE-Ready Templates**: Pre-built structures optimized for specific agentic workflows (e.g., "Act as a Senior React Dev").
- **Project Context Management**: Organize prompts by project to maintain continuity across development sessions.
- **Secure Architecture**: Enterprise-grade security ensures your proprietary prompt strategies remain private.

## 🏗️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend** | FastAPI | High-performance async Python web framework |
| **Database** | PostgreSQL | Robust relational database with AsyncPG |
| **Frontend** | React 19 | Modern UI library with Vite build tool |
| **Security** | OAuth2 + JWT | Stateless, secure authentication flow |

## 🔐 Security & Privacy

We treat your prompt IP as sensitive data:
- **Zero-Knowledge Storage**: Prompts are yours; we do not use them to train our models.
- **Bcrypt Hashing**: Industry-standard password protection.
- **Environment Isolation**: API keys for underlying LLMs are kept strictly in server-side environment variables.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- PostgreSQL Database

### 1. Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/promptops
SECRET_KEY=your_secure_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Providers
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
GROQ_API_KEY=your_key
```

Run the server:
```powershell
uvicorn main:app --reload
```

### 2. Frontend Setup

```powershell
# Navigate to frontend
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` | API Docs: `http://localhost:8000/docs`

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---
*Developed by Ketan Joshi.*
