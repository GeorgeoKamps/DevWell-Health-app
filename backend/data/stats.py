"""Derive real streaks + activity stats from the persisted activity log.

A "day" counts as active if at least one activity was logged on that calendar
date. The current streak is the run of consecutive active days ending today
(or yesterday — the streak stays alive until a full day is missed).
"""
from datetime import date, datetime, timedelta

from data import store
from models.schemas import StatsResponse, WeekCounts

_WEEK_TYPES = {"meal": "meals", "workout": "workouts", "water": "water", "break": "breaks"}


def _as_date(ts) -> date:
    if isinstance(ts, datetime):
        return ts.date()
    if isinstance(ts, date):
        return ts
    # ISO string fallback
    return datetime.fromisoformat(str(ts)).date()


def _active_dates(logs) -> set[date]:
    return {_as_date(e.timestamp) for e in logs if e.timestamp is not None}


def _current_streak(active: set[date], today: date) -> int:
    # Anchor on today if active, else yesterday (streak still alive), else 0.
    if today in active:
        anchor = today
    elif (today - timedelta(days=1)) in active:
        anchor = today - timedelta(days=1)
    else:
        return 0
    streak, day = 0, anchor
    while day in active:
        streak += 1
        day -= timedelta(days=1)
    return streak


def _longest_streak(active: set[date]) -> int:
    if not active:
        return 0
    longest = 1
    for d in active:
        if (d - timedelta(days=1)) in active:
            continue  # not the start of a run
        length, day = 1, d + timedelta(days=1)
        while day in active:
            length += 1
            day += timedelta(days=1)
        longest = max(longest, length)
    return longest


def compute_stats(today: date | None = None) -> StatsResponse:
    today = today or date.today()
    logs = store.list_logs()
    active = _active_dates(logs)

    week_start = today - timedelta(days=today.weekday())  # Monday
    week = WeekCounts()
    active_week_days: set[date] = set()
    for e in logs:
        if e.timestamp is None:
            continue
        d = _as_date(e.timestamp)
        if d >= week_start and e.type in _WEEK_TYPES:
            setattr(week, _WEEK_TYPES[e.type], getattr(week, _WEEK_TYPES[e.type]) + 1)
            active_week_days.add(d)

    return StatsResponse(
        current_streak=_current_streak(active, today),
        longest_streak=_longest_streak(active),
        active_days_this_week=len(active_week_days),
        total_logs=len(logs),
        logged_today=today in active,
        this_week=week,
    )


def compute_progress(period_days: int, today: date | None = None) -> "ProgressReport":
    """Aggregate the activity log over a trailing window (e.g. 7 or 30 days)
    into a doctor-friendly progress report: per-day breakdown + totals +
    streaks. Streaks are computed over the full history, not just the window."""
    from models.schemas import ProgressReport, DayActivity, WeekCounts

    today = today or date.today()
    start = today - timedelta(days=period_days - 1)  # inclusive window
    logs = store.list_logs()
    active_all = _active_dates(logs)

    # per-day tallies within the window
    per_day: dict[date, dict[str, int]] = {
        start + timedelta(days=i): {"meals": 0, "workouts": 0, "water": 0, "breaks": 0}
        for i in range(period_days)
    }
    totals = WeekCounts()
    for e in logs:
        if e.timestamp is None or e.type not in _WEEK_TYPES:
            continue
        d = _as_date(e.timestamp)
        if start <= d <= today:
            key = _WEEK_TYPES[e.type]
            per_day[d][key] += 1
            setattr(totals, key, getattr(totals, key) + 1)

    daily = []
    active_days = 0
    for d in sorted(per_day):
        c = per_day[d]
        total = c["meals"] + c["workouts"] + c["water"] + c["breaks"]
        if total > 0:
            active_days += 1
        daily.append(DayActivity(date=d.isoformat(), total=total, **c))

    label = "Weekly" if period_days <= 7 else ("Monthly" if period_days <= 31 else f"{period_days}-day")
    return ProgressReport(
        patient_name=store.get_profile().name or "DevWell user",
        period_label=label,
        start_date=start.isoformat(),
        end_date=today.isoformat(),
        days=period_days,
        current_streak=_current_streak(active_all, today),
        longest_streak=_longest_streak(active_all),
        active_days=active_days,
        totals=totals,
        daily=daily,
    )
