from urllib.parse import quote

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response

from chains.meal_chain import generate_meal_plan
from models.schemas import MealPlanRequest, MealPlanResponse
from tools import export_tool

router = APIRouter(prefix="/meal-plan", tags=["meal-plan"])


@router.post("", response_model=MealPlanResponse)
def meal_plan(req: MealPlanRequest) -> MealPlanResponse:
    """Generate a weekly meal plan + shopping list.

    Uses a Claude prompt chain when ANTHROPIC_API_KEY is set; otherwise returns
    mock data. The `generated_by` field tells you which path ran."""
    return generate_meal_plan(req)


@router.post("/export")
def export_meal_plan(plan: MealPlanResponse, format: str = Query("pdf")) -> Response:
    """Export a meal plan to a downloadable file.

    The frontend posts back the plan it's currently showing, so the export
    matches exactly what the user sees. `format` is "pdf" or "md"."""
    try:
        data, media_type, filename = export_tool.render(plan, format.lower())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"},
    )
