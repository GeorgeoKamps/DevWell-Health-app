"""Workout-generator prompt chain.

Given the user's available time, focus area, and level, asks Claude for a single
tailored session as JSON. Falls back to static mock data on any failure.
"""
from clients import claude
from chains.jsonutil import extract_json
from data import mock
from models.schemas import WorkoutRequest, WorkoutResponse, Exercise


def _mock(req: WorkoutRequest) -> WorkoutResponse:
    w = mock.WORKOUT
    return WorkoutResponse(
        title=w["title"],
        duration_min=min(req.available_minutes, w["duration_min"]),
        level=req.level,
        exercises=[Exercise(**e) for e in w["exercises"]],
        generated_by="mock",
    )


def generate_workout(req: WorkoutRequest) -> WorkoutResponse:
    if not claude.ai_enabled():
        return _mock(req)
    try:
        system = (
            "You are a fitness coach for developers who sit at a desk. You design safe, "
            "equipment-free sessions and always reply with valid JSON and nothing else."
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
            generated_by="claude",
        )
    except Exception:
        return _mock(req)
