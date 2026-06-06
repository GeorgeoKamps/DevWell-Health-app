from datetime import date
from fastapi import APIRouter
from data import store
from models.schemas import WeeklyReport, ReportCard, ReportInsight

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report() -> WeeklyReport:
    """Placeholder weekly aggregation. Will become an agent that analyzes the
    week's logs and generates personalized insights."""
    logs = store.list_logs()
    return WeeklyReport(
        week_of=f"Week of {date.today().isoformat()}",
        score=74,
        cards=[
            ReportCard(label="Workouts done", value="4 / 5", tone="accent"),
            ReportCard(label="Avg hydration", value="1.96L", tone="blue"),
            ReportCard(label="Avg sitting", value="5.6h", tone="amber"),
            ReportCard(label="Meals logged", value="18 / 21", tone="accent"),
        ],
        days=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        workouts=[1, 1, 0, 1, 0, 1, 0],
        water=[2.1, 1.8, 2.5, 1.4, 2.2, 2.0, 1.7],
        sitting=[6.2, 7.1, 5.8, 8.0, 6.5, 3.2, 2.1],
        insights=[
            ReportInsight(label="Workout consistency", value="80%", note="4 of 5 sessions", good=True),
            ReportInsight(label="Hydration goal", value="78%", note="Avg 1.96L / 2.5L goal"),
            ReportInsight(label="Sitting breaks", value="62%", note="Missed 38% of alerts"),
            ReportInsight(label="Meal logging", value="86%", note=f"{len(logs)} logged this session", good=True),
        ],
        tip=("You're nailing workouts — great job! Your main area to improve is hydration "
             "and sitting breaks. Try a water reminder every 90 mins and actually standing "
             "up when Byte nudges you. 🐸"),
    )
