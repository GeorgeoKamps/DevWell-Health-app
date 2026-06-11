"""Workout-generator prompt chain — RAG-grounded.

Retrieves relevant exercise/ergonomics snippets for the user's focus area and
grounds Claude's session in them. Falls back to static mock data on any failure.
Retrieval is local (no key needed), so sources are returned even in mock mode.
"""
from clients import claude
from chains.jsonutil import extract_json
from data import mock
from models.schemas import WorkoutRequest, WorkoutResponse, Exercise

try:
    from rag.retriever import retrieve
except Exception:  # pragma: no cover
    def retrieve(query, k=3):
        return []


def _mock(req: WorkoutRequest, sources) -> WorkoutResponse:
    w = mock.WORKOUT
    return WorkoutResponse(
        title=w["title"],
        duration_min=min(req.available_minutes, w["duration_min"]),
        level=req.level,
        exercises=[Exercise(**e) for e in w["exercises"]],
        sources=sources,
        generated_by="mock",
    )


def generate_workout(req: WorkoutRequest) -> WorkoutResponse:
    try:
        hits = retrieve(f"{req.focus} workout exercises stretches", k=3)
    except Exception:
        hits = []
    sources = list(dict.fromkeys(h["source"] for h in hits))

    if not claude.ai_enabled():
        return _mock(req, sources)
    try:
        context = "\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)
        system = (
            "You are a fitness coach for developers who sit at a desk. You design safe, "
            "equipment-free sessions and always reply with valid JSON and nothing else. "
            "Prefer the reference snippets below when relevant."
            + (f"\n\n--- Knowledge base snippets ---\n{context}" if context else "")
        )
        user = (
            f"Design a {req.level} workout that fits in {req.available_minutes} minutes, "
            f"focused on: {req.focus}. Include a short warm-up and cool-down. Use only "
            "bodyweight / desk-friendly moves.\n"
            'Return JSON shaped exactly: {"title": "...", "duration_min": 20, '
            '"exercises": [{"name": "Cat-cow stretch", "sets": "2 x 10"}, ...]}'
        )
        data = extract_json(claude.complete(system, user, max_tokens=1200))
        return WorkoutResponse(
            title=data["title"],
            duration_min=int(data.get("duration_min", req.available_minutes)),
            level=req.level,
            exercises=[Exercise(**e) for e in data["exercises"]],
            sources=sources,
            generated_by="claude",
        )
    except Exception:
        return _mock(req, sources)
