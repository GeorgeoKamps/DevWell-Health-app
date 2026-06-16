"""Meal-plan prompt chain — RAG-grounded + preference-aware.

The user can pass favourite foods, allergies, and disliked foods. With a Claude
key, a two-step chain builds the week (grounded in retrieved recipes) then the
shopping list. Offline, the mock plan still *respects* allergies/dislikes by
swapping out any offending meal — so a demo without a key still reacts to input.
"""
import itertools

from clients import claude
from chains.jsonutil import extract_json
from data import mock
from models.schemas import MealPlanRequest, MealPlanResponse, DayPlan

try:
    from rag.retriever import retrieve
except Exception:  # pragma: no cover
    def retrieve(query, k=3):
        return []

# Allergy/dislike-safe swaps used by the offline fallback (no meat/fish/nuts/dairy/egg).
_SAFE_SWAPS = [
    "Garden salad bowl", "Roasted veggie medley", "Rice & beans",
    "Veggie stir-fry", "Fruit & oats", "Quinoa tabbouleh",
    "Minestrone soup", "Stuffed peppers",
]


def _excluded_terms(req: MealPlanRequest) -> list[str]:
    return [t.strip().lower() for t in (req.allergies + req.disliked_foods) if t.strip()]


def _mock_plan(req: MealPlanRequest, sources) -> MealPlanResponse:
    excluded = _excluded_terms(req)
    favs = [f.strip() for f in req.favorite_foods if f.strip()]
    swaps = itertools.cycle(_SAFE_SWAPS)

    def clean(meal: str) -> str:
        if excluded and any(x in meal.lower() for x in excluded):
            for _ in range(len(_SAFE_SWAPS)):
                cand = next(swaps)
                if not any(x in cand.lower() for x in excluded):
                    return cand
            return "Chef's pick (allergy-safe)"
        return meal

    days = []
    for d in mock.WEEK_MEALS[: req.days]:
        day = dict(d)
        for slot in ("breakfast", "lunch", "dinner"):
            day[slot] = clean(day[slot])
        days.append(day)

    # Feature a favourite on day 1 so the plan visibly reflects likes.
    if favs and days:
        days[0]["dinner"] = f"{favs[0].title()} bowl"

    shopping = [s for s in mock.SHOPPING_LIST if not any(x in s.lower() for x in excluded)]
    if favs:
        shopping = list(dict.fromkeys(favs + shopping))

    return MealPlanResponse(
        days=[DayPlan(**d) for d in days],
        shopping_list=shopping,
        sources=sources,
        generated_by="mock",
    )


def _prefs_text(req: MealPlanRequest) -> str:
    parts = []
    if req.favorite_foods:
        parts.append(f"Favourite foods — feature these when they fit naturally: {', '.join(req.favorite_foods)}.")
    if req.allergies:
        parts.append(f"STRICT ALLERGIES — never include these or any dish containing them: {', '.join(req.allergies)}.")
    if req.disliked_foods:
        parts.append(f"Disliked foods — avoid these, the person doesn't enjoy them: {', '.join(req.disliked_foods)}.")
    return (" " + " ".join(parts)) if parts else ""


def _build_days(req: MealPlanRequest, context: str) -> list[DayPlan]:
    system = (
        "You are a nutrition planner for busy developers. You always reply with valid JSON "
        "and nothing else. Respect the user's dietary preferences strictly — especially allergies. "
        "Prefer the reference recipe snippets below when relevant."
        + (f"\n\n--- Knowledge base snippets ---\n{context}" if context else "")
    )
    user = (
        f"Create a balanced {req.days}-day meal plan for a {req.diet} diet, max {req.max_cook_time_min} "
        f"minutes cook time per meal, for {req.people} person(s). Vary the meals across days."
        + _prefs_text(req) + "\n"
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
        days = _build_days(req, context)
        shopping = _build_shopping(days)
        return MealPlanResponse(days=days, shopping_list=shopping, sources=sources, generated_by="claude")
    except Exception:
        return _mock_plan(req, sources)
