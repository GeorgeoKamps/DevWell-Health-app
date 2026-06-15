"""DevWell API — FastAPI backend.

Run locally:
    cd backend
    python -m venv venv && source venv/bin/activate   # Windows: venv\\Scripts\\activate
    pip install -r requirements.txt
    uvicorn main:app --reload

Interactive docs: http://localhost:8000/docs
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from db import init_db
from routers import auth, profile, meal_plan, workout, nudge, chat, log, report, mood, search, stats

init_db()

app = FastAPI(
    title="DevWell API",
    description="The health companion for developers.",
    version="0.6.0",
)

_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, profile, meal_plan, workout, nudge, chat, log, report, mood, search, stats):
    app.include_router(r.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"app": "DevWell API", "version": "0.6.0", "docs": "/docs", "status": "ok"}


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "healthy", "ai_enabled": bool(os.getenv("ANTHROPIC_API_KEY"))}
