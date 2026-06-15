"""Streak math + /stats endpoint."""
from datetime import date, datetime, timedelta

from data import store, stats
from models.schemas import LogRequest


def _log_on(user_id, d, type_="break"):
    store.add_log(user_id, LogRequest(type=type_, detail="x", timestamp=datetime(d.year, d.month, d.day, 12, 0)))


def test_no_logs_is_all_zero(user_id):
    s = stats.compute_stats(user_id, date(2026, 6, 13))
    assert s.current_streak == 0 and s.longest_streak == 0
    assert s.total_logs == 0 and s.logged_today is False


def test_consecutive_days_ending_today(user_id):
    today = date(2026, 6, 13)
    for d in (today, today - timedelta(days=1), today - timedelta(days=2)):
        _log_on(user_id, d)
    s = stats.compute_stats(user_id, today)
    assert s.current_streak == 3 and s.longest_streak == 3 and s.logged_today is True


def test_streak_survives_until_a_full_day_missed(user_id):
    today = date(2026, 6, 13)
    _log_on(user_id, today - timedelta(days=1))
    _log_on(user_id, today - timedelta(days=2))
    s = stats.compute_stats(user_id, today)
    assert s.current_streak == 2 and s.logged_today is False


def test_gap_breaks_current_but_longest_remembers(user_id):
    today = date(2026, 6, 13)
    for d in (today - timedelta(days=i) for i in (10, 9, 8, 7)):
        _log_on(user_id, d)
    _log_on(user_id, today)
    s = stats.compute_stats(user_id, today)
    assert s.current_streak == 1 and s.longest_streak == 4


def test_same_day_multiple_logs_count_one_day(user_id):
    today = date(2026, 6, 13)
    for t in ("meal", "workout", "water"):
        _log_on(user_id, today, t)
    s = stats.compute_stats(user_id, today)
    assert s.current_streak == 1 and s.active_days_this_week == 1
    assert s.this_week.meals == 1 and s.this_week.workouts == 1 and s.this_week.water == 1


def test_endpoint(auth_client):
    auth_client.post("/log", json={"type": "break", "detail": "stretch"})
    body = auth_client.get("/stats").json()
    assert body["total_logs"] == 1 and body["current_streak"] == 1
    assert body["logged_today"] is True and body["this_week"]["breaks"] == 1
