from fastapi import APIRouter
from chains.meal_chain import generate_meal_plan
from models.schemas import MealPlanRequest, MealPlanResponse

router = APIRouter(prefix="/meal-plan", tags=["meal-plan"])


@router.post("", response_model=MealPlanResponse)
def meal_plan(req: MealPlanRequest) -> MealPlanResponse:
    """Generate a weekly meal plan + shopping list.

    Uses a Claude prompt chain when ANTHROPIC_API_KEY is set; otherwise returns
    mock data. The `generated_by` field tells you which path ran."""
    return generate_meal_plan(req)
