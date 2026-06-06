from fastapi import APIRouter
from data import mock
from models.schemas import MealPlanRequest, MealPlanResponse, DayPlan

router = APIRouter(prefix="/meal-plan", tags=["meal-plan"])


@router.post("", response_model=MealPlanResponse)
def generate_meal_plan(req: MealPlanRequest) -> MealPlanResponse:
    """Placeholder weekly plan. Will become a Claude prompt chain
    (retrieve recipes -> build week -> consolidate shopping list)."""
    days = [DayPlan(**d) for d in mock.WEEK_MEALS[: req.days]]
    return MealPlanResponse(days=days, shopping_list=mock.SHOPPING_LIST)
