"""Streak math + /stats endpoint."""
from datetime import date, datetime, timedelta

from data import store, stats
from models.schemas import LogRequest


def _log_on(d: date, type_="break"):
    store.add_log(LogRequest(type=type_, detail="x", timestamp=datetime(d.year, d.month, d.day, 12, 0)))


def test_no_logs_is_all_zero():
    s = stats.compute_stats(date(2026, 6, 13))
    assert s.current_streak == 0 and s.longest_streak == 0
    assert s.total_logs == 0 and s.logged_today is False


def test_consecutive_days_ending_today():
    today = date(2026, 6, 13)
    for d in (today, today - timedelta(days=1), today - timedelta(days=2)):
        _log_on(d)
    s = stats.compute_stats(today)
    assert s.current_streak == 3
    assert s.longest_streak == 3
    assert s.logged_today is True


def test_streak_survives_until_a_full_day_missed():
    today = date(2026, 6, 13)
    # logged yesterday + day before, nothing today yet -> streak still alive (2)
    _log_on(today - timedelta(days=1))
    _log_on(today - timedelta(days=2))
    s = stats.compute_stats(today)
    assert s.current_streak == 2
    assert s.logged_today is False


def test_gap_breaks_current_but_longest_remembers():
    today = date(2026, 6, 13)
    # a 4-day run last week, then a gap, then 1 day today
    for d in (today - timedelta(days=i) for i in (10, 9, 8, 7)):
        _log_on(d)
    _log_on(today)
    s = stats.compute_stats(today)
    assert s.current_streak == 1       # only today
    assert s.longest_streak == 4       # the old run


def test_same_day_multiple_logs_count_one_day():
    today = date(2026, 6, 13)
    _log_on(today, "meal")
    _log_on(today, "workout")
    _log_on(today, "water")
    s = stats.compute_stats(today)
    assert s.current_streak == 1
    assert s.active_days_this_week == 1
    assert s.this_week.meals == 1 and s.this_week.workouts == 1 and s.this_week.water == 1


def test_endpoint(client):
    # one log today via the API, then check /stats reflects it
    client.post("/log", json={"type": "break", "detail": "stretch"})
    r = client.get("/stats")
    assert r.status_code == 200
    body = r.json()
    assert body["total_logs"] == 1
    assert body["current_streak"] == 1
    assert body["logged_today"] is True
    assert body["this_week"]["breaks"] == 1
