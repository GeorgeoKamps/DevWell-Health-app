from fastapi import APIRouter
from chains.report_chain import generate_report
from models.schemas import WeeklyReport

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report() -> WeeklyReport:
    """Weekly health report. When ANTHROPIC_API_KEY is set and there's logged
    data, Claude analyzes it for score + insights + tip; otherwise mock."""
    return generate_report()
