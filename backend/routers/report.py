from fastapi import APIRouter, Depends
from core_auth import get_current_user
from data.orm import UserRow
from chains.report_chain import generate_report
from models.schemas import WeeklyReport

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report(user: UserRow = Depends(get_current_user)) -> WeeklyReport:
    """Weekly health report for the signed-in user."""
    return generate_report(user.id)
