# PromptOps

A development orchestration platform.

## Prerequisites

- Node.js
- Python (3.8+)

## Quick Start

### 1. Start Support Backend

Open a terminal and navigate to the `backend` folder:

```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will start at http://localhost:8000.

### 2. Start Frontend

Open a **new** terminal and navigate to the `frontend` folder:

```powershell
cd frontend
npm install
npm run dev
```

The UI will start at http://localhost:5173.
