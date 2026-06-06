from datetime import date
from fastapi import APIRouter
from data import store
from models.schemas import WeeklyReport

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report() -> WeeklyReport:
    """Placeholder weekly aggregation. Will become an agent that analyzes the
    week's logs and generates personalized insights."""
    logs = store.list_logs()
    return WeeklyReport(
        week_of=date.today().isoformat(),
        summary="Solid week! You stayed consistent with breaks and logged most meals.",
        stats={
            "logs_recorded": str(len(logs)),
            "workouts": "3 / 5",
            "breaks_taken": "12",
            "avg_sitting_streak": "47 min",
        },
        insights=[
            "You skipped dinner logging twice — try a quick tap after eating.",
            "Best break consistency was Tuesday. Replicate that rhythm.",
            "Hydration trended below goal on Friday.",
        ],
    )
