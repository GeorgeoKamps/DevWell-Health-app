from fastapi import APIRouter
from data.stats import compute_stats
from models.schemas import StatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
def stats() -> StatsResponse:
    """Real streaks + this-week activity counts, derived from the activity log."""
    return compute_stats()
