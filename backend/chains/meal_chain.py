"""Meal-plan prompt chain.

Two Claude steps, each feeding the next (a real prompt chain):
  1. Build a balanced N-day plan as JSON.
  2. Consolidate the week's ingredients into a shopping list.

Any failure (no key, network error, bad JSON) falls back to static mock data,
so the endpoint always returns a valid response.
"""
import json
import re

from clients import claude
from data import mock
from models.schemas import MealPlanRequest, MealPlanResponse, DayPlan


def _extract_json(text: str):
    """Pull the first JSON object/array out of a model response (handles ```json fences)."""
    fenced = re.search(r"```(?:json)?\s*(.+?)```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    start = min((i for i in (text.find("{"), text.find("[")) if i != -1), default=-1)
    if start == -1:
        raise ValueError("no JSON found in response")
    depth, end = 0, -1
    for i, ch in enumerate(text[start:], start):
        if ch in "{[":
            depth += 1
        elif ch in "}]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    return json.loads(text[start:end])


def _mock_plan(req: MealPlanRequest) -> MealPlanResponse:
    days = [DayPlan(**d) for d in mock.WEEK_MEALS[: req.days]]
    return MealPlanResponse(days=days, shopping_list=mock.SHOPPING_LIST, generated_by="mock")


def _build_days(req: MealPlanRequest) -> list[DayPlan]:
    system = (
        "You are a nutrition planner for busy developers. You always reply with valid JSON "
        "and nothing else."
    )
    user = (
        f"Create a balanced {req.days}-day meal plan for a {req.diet} diet, max {req.max_cook_time_min} "
        f"minutes cook time per meal, for {req.people} person(s). Vary the meals across days.\n"
        'Return JSON shaped exactly: {"days": [{"day": "Monday", "breakfast": "...", '
        '"lunch": "...", "dinner": "...", "kcal": 1800}, ...]}. kcal is the estimated daily total.'
    )
    data = _extract_json(claude.complete(system, user, max_tokens=2000))
    return [DayPlan(**d) for d in data["days"]][: req.days]


def _build_shopping(days: list[DayPlan]) -> list[str]:
    menu = "; ".join(f"{d.day}: {d.breakfast}, {d.lunch}, {d.dinner}" for d in days)
    system = "You are a helpful kitchen assistant. You always reply with valid JSON and nothing else."
    user = (
        "Consolidate the ingredients needed for this week of meals into a practical, de-duplicated "
        "shopping list with rough quantities.\n"
        f"Meals: {menu}\n"
        'Return JSON shaped exactly: {"shopping_list": ["Chicken breast (500g)", "Oats (1kg)", ...]}'
    )
    data = _extract_json(claude.complete(system, user, max_tokens=1000))
    return data["shopping_list"]


def generate_meal_plan(req: MealPlanRequest) -> MealPlanResponse:
    if not claude.ai_enabled():
        return _mock_plan(req)
    try:
        days = _build_days(req)          # step 1
        shopping = _build_shopping(days)  # step 2 (feeds on step 1's output)
        return MealPlanResponse(days=days, shopping_list=shopping, generated_by="claude")
    except Exception:
        # Network error, invalid model, malformed JSON, etc. -> graceful fallback.
        return _mock_plan(req)
