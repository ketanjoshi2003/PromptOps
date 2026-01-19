from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import prompt_routes, chat_routes, auth_routes, chain_routes

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(prompt_routes.router, prefix="/api", tags=["prompts"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(chain_routes.router, prefix="/api/chain", tags=["chain"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PromptOps API (Restructured Mode)"}
