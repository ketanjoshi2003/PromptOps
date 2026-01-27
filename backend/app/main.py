from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import auth_routes, prompt_routes, chat_routes, chain_routes, plan_routes

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    # Add production frontend URL
    os.getenv("FRONTEND_URL", ""),
    "https://promptops-frontend.onrender.com", # Guessed pattern, or user can update
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.utils.limiter import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(prompt_routes.router, prefix="/api", tags=["prompts"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(chain_routes.router, prefix="/api/chain", tags=["chain"])
app.include_router(plan_routes.router, prefix="/api/plan", tags=["plan"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PromptOps API (Restructured Mode)"}
