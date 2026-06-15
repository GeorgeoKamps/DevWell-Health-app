from urllib.parse import quote

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import Response

from core_auth import get_current_user
from data import store
from data.orm import UserRow
from chains.meal_chain import generate_meal_plan
from models.schemas import MealPlanRequest, MealPlanResponse
from tools import export_tool

router = APIRouter(prefix="/meal-plan", tags=["meal-plan"])


@router.post("", response_model=MealPlanResponse)
def meal_plan(req: MealPlanRequest, user: UserRow = Depends(get_current_user)) -> MealPlanResponse:
    """Generate a weekly meal plan + shopping list. If the request doesn't carry
    favorite foods, we pull them from the user's profile so plans lean toward
    foods they like."""
    if not req.favorite_foods:
        req.favorite_foods = store.get_profile(user.id).favorite_foods
    return generate_meal_plan(req)


@router.post("/export")
def export_meal_plan(
    plan: MealPlanResponse,
    format: str = Query("pdf"),
    user: UserRow = Depends(get_current_user),
) -> Response:
    """Export a meal plan to a downloadable PDF or Markdown file."""
    try:
        data, media_type, filename = export_tool.render(plan, format.lower())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"},
    )
