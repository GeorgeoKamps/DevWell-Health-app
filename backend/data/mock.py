"""Static placeholder data used by the stubbed routes.

This is intentionally hard-coded for the scaffold phase. Each value will later
be replaced by Claude prompt chains / RAG output, but the shapes stay the same.
"""

WEEK_MEALS = [
    {"day": "Monday",    "breakfast": "Oats + berries",       "lunch": "Tuna salad wrap",         "dinner": "Grilled salmon + quinoa", "kcal": 1820},
    {"day": "Tuesday",   "breakfast": "Greek yogurt + granola", "lunch": "Chicken grain bowl",     "dinner": "Stir-fry veggies + tofu", "kcal": 1760},
    {"day": "Wednesday", "breakfast": "Avocado toast + egg",  "lunch": "Lentil soup + bread",      "dinner": "Turkey meatballs + pasta", "kcal": 1900},
    {"day": "Thursday",  "breakfast": "Smoothie bowl",        "lunch": "Caesar salad + chicken",   "dinner": "Baked cod + sweet potato", "kcal": 1680},
    {"day": "Friday",    "breakfast": "Overnight oats",       "lunch": "Hummus wrap + veggies",    "dinner": "Beef stir-fry + rice",    "kcal": 1950},
    {"day": "Saturday",  "breakfast": "Pancakes + fruit",     "lunch": "Tomato soup + grilled cheese", "dinner": "Homemade pizza",      "kcal": 2100},
    {"day": "Sunday",    "breakfast": "Eggs + toast + OJ",    "lunch": "Leftovers",                "dinner": "Roast chicken + veggies", "kcal": 1850},
]

SHOPPING_LIST = [
    "Chicken breast (500g)", "Salmon fillets (400g)", "Greek yogurt (1kg)", "Quinoa (500g)",
    "Mixed greens (3 bags)", "Avocados (4)", "Eggs (12)", "Sweet potatoes (4)", "Lentils (400g)",
    "Oats (1kg)", "Berries (frozen, 500g)", "Olive oil", "Lemons (4)", "Garlic (1 bulb)",
    "Cherry tomatoes (500g)",
]

WORKOUT = {
    "title": "Desk Break Stretch",
    "duration_min": 15,
    "level": "easy",
    "exercises": [
        {"name": "Shoulder rolls", "sets": "3 x 10"},
        {"name": "Seated twist", "sets": "2 x 30s"},
        {"name": "Hip flexor stretch", "sets": "2 x 45s"},
        {"name": "Neck tilts", "sets": "2 x 30s"},
        {"name": "Standing calf raises", "sets": "3 x 20"},
    ],
}

NUDGES = [
    "You've been git blame-ing for 45 mins straight. Stand up before your chair files a bug report.",
    "Compile time for your spine. Stand up and stretch — no merge conflicts allowed.",
    "Your last commit was 'fix later'. Your body says 'stretch now'.",
    "Uptime: too long. Time to redeploy your posture.",
]

MICRO_BREAKS = [
    {"title": "Shoulder rolls", "detail": "10 slow rolls back, then 10 forward."},
    {"title": "Eye reset (20-20-20)", "detail": "Look ~6 metres away for 20 seconds."},
    {"title": "Standing calf raises", "detail": "20 reps to get the blood moving."},
]

CHAT_CANNED = (
    "Here's a quick idea: a chickpea & quinoa bowl with roasted veg takes ~20 minutes "
    "and packs ~25g of protein. (This is placeholder text — the RAG-powered answer "
    "lands once the AI layer is wired up.)"
)
