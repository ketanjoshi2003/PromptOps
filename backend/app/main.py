from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import auth_routes, prompt_routes, chat_routes, chain_routes, plan_routes, feedback_routes

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
    "https://promptops-frontend.onrender.com", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.(vercel\.app|netlify\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.utils.limiter import limiter
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # HSTS (Strict-Transport-Security) - enforce HTTPS for 1 year
        # Only enable if utilizing HTTPS (Render/Vercel usually do)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"]) # In production, list specific domains

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(prompt_routes.router, prefix="/api", tags=["prompts"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(chain_routes.router, prefix="/api/chain", tags=["chain"])
app.include_router(plan_routes.router, prefix="/api/plan", tags=["plan"])
app.include_router(feedback_routes.router, prefix="/api/feedback", tags=["feedback"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PromptOps API (Restructured Mode)"}
