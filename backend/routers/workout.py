from fastapi import APIRouter
from chains.workout_chain import generate_workout
from models.schemas import WorkoutRequest, WorkoutResponse

router = APIRouter(prefix="/workout", tags=["workout"])


@router.post("", response_model=WorkoutResponse)
def workout(req: WorkoutRequest) -> WorkoutResponse:
    """Generate a tailored workout session. Uses a Claude chain when
    ANTHROPIC_API_KEY is set; otherwise returns mock data."""
    return generate_workout(req)
