from fastapi import APIRouter, Depends
from core_auth import get_current_user
from data.orm import UserRow
from chains.workout_chain import generate_workout
from models.schemas import WorkoutRequest, WorkoutResponse

router = APIRouter(prefix="/workout", tags=["workout"])


@router.post("", response_model=WorkoutResponse)
def workout(req: WorkoutRequest, user: UserRow = Depends(get_current_user)) -> WorkoutResponse:
    """Generate a tailored workout session. Uses a Claude chain when
    ANTHROPIC_API_KEY is set; otherwise returns mock data."""
    return generate_workout(req)
