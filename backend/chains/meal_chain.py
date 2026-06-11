"""Meal-plan prompt chain — RAG-grounded.

Two Claude steps, each feeding the next:
  1. Build a balanced N-day plan as JSON (grounded in retrieved recipe snippets).
  2. Consolidate the week's ingredients into a shopping list.

Any failure (no key, network error, bad JSON) falls back to static mock data.
Retrieval is local, so sources are returned even in mock mode.
"""
from clients import claude
from chains.jsonutil import extract_json
from data import mock
from models.schemas import MealPlanRequest, MealPlanResponse, DayPlan

try:
    from rag.retriever import retrieve
except Exception:  # pragma: no cover
    def retrieve(query, k=3):
        return []


def _mock_plan(req: MealPlanRequest, sources) -> MealPlanResponse:
    days = [DayPlan(**d) for d in mock.WEEK_MEALS[: req.days]]
    return MealPlanResponse(days=days, shopping_list=mock.SHOPPING_LIST, sources=sources, generated_by="mock")


def _build_days(req: MealPlanRequest, context: str) -> list[DayPlan]:
    system = (
        "You are a nutrition planner for busy developers. You always reply with valid JSON "
        "and nothing else. Prefer the reference recipe snippets below when relevant."
        + (f"\n\n--- Knowledge base snippets ---\n{context}" if context else "")
    )
    user = (
        f"Create a balanced {req.days}-day meal plan for a {req.diet} diet, max {req.max_cook_time_min} "
        f"minutes cook time per meal, for {req.people} person(s). Vary the meals across days.\n"
        'Return JSON shaped exactly: {"days": [{"day": "Monday", "breakfast": "...", '
        '"lunch": "...", "dinner": "...", "kcal": 1800}, ...]}. kcal is the estimated daily total.'
    )
    data = extract_json(claude.complete(system, user, max_tokens=2000))
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
    data = extract_json(claude.complete(system, user, max_tokens=1000))
    return data["shopping_list"]


def generate_meal_plan(req: MealPlanRequest) -> MealPlanResponse:
    try:
        hits = retrieve(f"{req.diet} recipes meals high protein quick", k=3)
    except Exception:
        hits = []
    sources = list(dict.fromkeys(h["source"] for h in hits))

    if not claude.ai_enabled():
        return _mock_plan(req, sources)
    try:
        context = "\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)
        days = _build_days(req, context)        # step 1 (grounded in recipes)
        shopping = _build_shopping(days)         # step 2 (feeds on step 1's output)
        return MealPlanResponse(days=days, shopping_list=shopping, sources=sources, generated_by="claude")
    except Exception:
        return _mock_plan(req, sources)
