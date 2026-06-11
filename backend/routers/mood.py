from fastapi import APIRouter
from chains.mood_chain import detect_mood
from models.schemas import MoodRequest, MoodResponse

router = APIRouter(prefix="/mood", tags=["mood"])


@router.post("", response_model=MoodResponse)
def mood(req: MoodRequest) -> MoodResponse:
    """Detect mood from a message and return an empathetic reply + a breathing
    exercise and a physical reset. Uses Claude when a key is set; else a gentle
    fallback."""
    return detect_mood(req)
