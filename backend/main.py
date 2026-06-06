"""DevWell API — FastAPI backend (scaffold phase).

All routes return placeholder data for now. The AI layer (Claude prompt chains,
RAG, the sitting-alert agent) gets wired in on top of these stubs later.

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
except ImportError:  # python-dotenv optional at runtime
    pass

from routers import profile, meal_plan, workout, nudge, chat, log, report

app = FastAPI(
    title="DevWell API",
    description="The health companion for developers — backend scaffold.",
    version="0.1.0",
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

for r in (profile, meal_plan, workout, nudge, chat, log, report):
    app.include_router(r.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"app": "DevWell API", "version": "0.1.0", "docs": "/docs", "status": "ok"}


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "healthy", "ai_enabled": bool(os.getenv("ANTHROPIC_API_KEY"))}
