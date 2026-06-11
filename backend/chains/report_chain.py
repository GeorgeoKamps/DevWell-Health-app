"""Weekly health-report chain.

Aggregates the week's logged activity (from the in-memory store) into real
summary cards, then asks Claude to produce a score, insights, and a coaching tip
grounded in those numbers. Falls back to static mock data when there's no key
or no logged data yet.
"""
from datetime import date

from clients import claude
from chains.jsonutil import extract_json
from data import store
from models.schemas import WeeklyReport, ReportCard, ReportInsight

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
# Illustrative daily series for the charts (we don't track per-day breakdowns yet).
WORKOUTS = [1, 1, 0, 1, 0, 1, 0]
WATER = [2.1, 1.8, 2.5, 1.4, 2.2, 2.0, 1.7]
SITTING = [6.2, 7.1, 5.8, 8.0, 6.5, 3.2, 2.1]


def _counts():
    counts = {"meal": 0, "workout": 0, "water": 0, "break": 0}
    for entry in store.list_logs():
        if entry.type in counts:
            counts[entry.type] += 1
    return counts


def _cards(counts) -> list[ReportCard]:
    return [
        ReportCard(label="Meals logged", value=str(counts["meal"]), tone="accent"),
        ReportCard(label="Workouts", value=str(counts["workout"]), tone="amber"),
        ReportCard(label="Water", value=f"{counts['water'] * 250}ml", tone="blue"),
        ReportCard(label="Breaks", value=str(counts["break"]), tone="accent"),
    ]


def _mock() -> WeeklyReport:
    return WeeklyReport(
        week_of=f"Week of {date.today().isoformat()}",
        score=74,
        cards=[
            ReportCard(label="Workouts done", value="4 / 5", tone="accent"),
            ReportCard(label="Avg hydration", value="1.96L", tone="blue"),
            ReportCard(label="Avg sitting", value="5.6h", tone="amber"),
            ReportCard(label="Meals logged", value="18 / 21", tone="accent"),
        ],
        days=DAYS, workouts=WORKOUTS, water=WATER, sitting=SITTING,
        insights=[
            ReportInsight(label="Workout consistency", value="80%", note="4 of 5 sessions", good=True),
            ReportInsight(label="Hydration goal", value="78%", note="Avg 1.96L / 2.5L goal"),
            ReportInsight(label="Sitting breaks", value="62%", note="Missed 38% of alerts"),
            ReportInsight(label="Meal logging", value="86%", note="18 of 21 meals logged", good=True),
        ],
        tip="You're nailing workouts — focus next on hydration and sitting breaks. 🐸",
        generated_by="mock",
    )


def generate_report() -> WeeklyReport:
    counts = _counts()
    total = sum(counts.values())
    if not claude.ai_enabled() or total == 0:
        return _mock()
    try:
        summary = (
            f"This week the developer logged: {counts['meal']} meals, {counts['workout']} workouts, "
            f"{counts['water']} water intakes (~{counts['water'] * 250}ml total), "
            f"{counts['break']} standing breaks. Total {total} entries."
        )
        system = (
            "You are a wellness analyst for developers. Given a week of activity, you produce an "
            "encouraging, specific report. You always reply with valid JSON and nothing else."
        )
        user = (
            f"{summary}\n"
            "Score the week 0-100 and give 3-4 short insights plus one coaching tip.\n"
            'Return JSON shaped exactly: {"score": 74, "insights": [{"label": "...", "value": "...", '
            '"note": "...", "good": true}], "tip": "..."}'
        )
        data = extract_json(claude.complete(system, user, max_tokens=900))
        insights = [ReportInsight(**i) for i in data["insights"]]
        return WeeklyReport(
            week_of=f"Week of {date.today().isoformat()}",
            score=int(data["score"]),
            cards=_cards(counts),
            days=DAYS, workouts=WORKOUTS, water=WATER, sitting=SITTING,
            insights=insights,
            tip=data["tip"],
            generated_by="claude",
        )
    except Exception:
        return _mock()
