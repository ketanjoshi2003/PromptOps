# 🚀 PromptOps

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688)
![License](https://img.shields.io/badge/License-MIT-green)

**PromptOps** is a specialized, open-source prompt engineering platform designed to supercharge AI-assisted software development. It generates context-rich, high-level prompts optimized for AI-native IDEs like **Antigravity**, **Cursor**, **Blackbox**, and **Claude Dev**.

By structuring requirements into token-efficient, comprehensive instructions, PromptOps enables developers to build MVPs faster with significantly reduced back-and-forth iteration.

---

## 📌 Table of Contents
* [🌟 Features](#-features)
* [🏗️ System Architecture](#️-system-architecture)
* [📂 Project Structure](#-project-structure)
* [⚙️ Getting Started](#️-getting-started)
  * [Prerequisites](#prerequisites)
  * [Database Setup](#1-database-setup)
  * [Backend Setup](#2-backend-setup)
  * [Frontend Setup](#3-frontend-setup)
* [🧪 Running Tests](#-running-tests)
* [🔒 Security & Privacy](#-security--privacy)
* [🤝 Contributing](#-contributing)
* [📄 License](#-license)

---

## 🌟 Features

* **✨ High-Level Prompt Generation**: Transforms abstract ideas into detailed, architectural-level prompts that AI agents understand immediately.
* **📉 Token Efficiency**: Optimized prompt structures maximize context window value, reducing API costs and "memory loss" in long sessions.
* **🔄 Multi-Model Orchestration**: Compare outputs from Gemini, OpenAI, and Groq to find the best phrasing for your AI coder.
* **🏎️ Pre-built IDE Templates**: Pre-configured structures optimized for specific agentic workflows (e.g., "Act as a Senior React Dev").
* **📁 Project Context Management**: Organize prompts by project to maintain continuity across development sessions.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[React 19 Frontend] <-->|JSON / HTTPS| Server[FastAPI Async Server]
    Server <-->|SQLAlchemy + AsyncPG| DB[(PostgreSQL Database)]
    Server <-->|API Request| LLM[AI Providers: Gemini, OpenAI, Groq]
```

---

## 📂 Project Structure

```
PromptOps/
├── backend/                  # FastAPI Python backend
│   ├── app/                  # Main application package
│   │   ├── api/              # HTTP routers & controllers
│   │   ├── config/           # App settings & env configuration
│   │   ├── db/               # SQLAlchemy models & database sessions
│   │   ├── prompt_engine/    # Prompt templates & token compiler
│   │   ├── services/         # Third-party integrations (Gemini, OpenAI, etc.)
│   │   └── utils/            # Helper functions (security, limiters)
│   └── tests/                # Automated pytest suite
└── frontend/                 # React 19 SPA frontend (Vite)
    ├── src/
    │   ├── components/       # Shared UI components (Layouts, Modals, forms)
    │   ├── pages/            # View pages (Chat, Settings, Dashboard)
    │   ├── services/         # API client layer (authService, promptService)
    │   └── index.css         # TailwindCSS/CSS tokens & styling
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.8+)
* **PostgreSQL** (v12+)

### 1. Database Setup
Ensure PostgreSQL is running locally, then create a new database:
```sql
CREATE DATABASE promptops;
```

### 2. Backend Setup
Navigate to the `backend` folder, create a Python virtual environment, and install dependencies:
```bash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\activate

# On Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/promptops
SECRET_KEY=your_secure_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys for AI Providers (Provide at least one)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

Run database migrations to initialize tables:
```bash
python update_schema.py
```

Start the backend server:
```bash
uvicorn main:app --reload
```
* API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
Navigate to the `frontend` folder and install NPM packages:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (if configuring custom URLs):
```env
VITE_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```
* The React client will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Tests

PromptOps includes a comprehensive test suite to verify backend functionality. To run the automated tests:

```bash
cd backend
python -m pytest
```

---

## 🔒 Security & Privacy
* **Zero-Knowledge Architecture**: Prompts generated and managed locally are not stored on remote servers; your prompt IP is kept completely safe.
* **Rate Limiting**: Integrated with SlowAPI to protect endpoints from automated scraping and spam attacks.
* **Environment Separation**: API keys for external models are kept strictly in server-side configuration, keeping them safe from exposure in client code.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---
*Developed by **Ketan Joshi**.*
