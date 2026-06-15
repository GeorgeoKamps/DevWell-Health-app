from urllib.parse import quote

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import Response

from core_auth import get_current_user
from data.orm import UserRow
from data.stats import compute_stats, compute_progress
from models.schemas import StatsResponse
from tools import export_tool

router = APIRouter(prefix="/stats", tags=["stats"])

_PERIODS = {"weekly": 7, "monthly": 30}


@router.get("", response_model=StatsResponse)
def stats(user: UserRow = Depends(get_current_user)) -> StatsResponse:
    """Real streaks + this-week activity counts for the signed-in user."""
    return compute_stats(user.id)


@router.get("/report")
def progress_report(
    period: str = Query("weekly"),
    format: str = Query("pdf"),
    user: UserRow = Depends(get_current_user),
) -> Response:
    """Doctor-friendly progress report over a period (weekly=7d, monthly=30d)."""
    days = _PERIODS.get(period.lower())
    if days is None:
        raise HTTPException(status_code=400, detail=f"unsupported period: {period!r}")
    report = compute_progress(user.id, days)
    try:
        data, media_type, filename = export_tool.render_progress(report, format.lower())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"},
    )
