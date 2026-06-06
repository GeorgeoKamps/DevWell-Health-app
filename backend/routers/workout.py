from fastapi import APIRouter
from data import mock
from models.schemas import WorkoutRequest, WorkoutResponse, Exercise

router = APIRouter(prefix="/workout", tags=["workout"])


@router.post("", response_model=WorkoutResponse)
def generate_workout(req: WorkoutRequest) -> WorkoutResponse:
    """Placeholder session. Will become RAG over an exercise knowledge base."""
    w = mock.WORKOUT
    return WorkoutResponse(
        title=w["title"],
        duration_min=min(req.available_minutes, w["duration_min"]),
        level=req.level,
        exercises=[Exercise(**e) for e in w["exercises"]],
    )
