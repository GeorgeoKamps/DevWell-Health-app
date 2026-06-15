"""Period progress report: computation, rendering, and endpoint."""
from datetime import date, datetime, timedelta

from data import store, stats
from tools import export_tool
from models.schemas import LogRequest


def _log_on(user_id, d, type_="meal"):
    store.add_log(user_id, LogRequest(type=type_, detail="x", timestamp=datetime(d.year, d.month, d.day, 9, 0)))


def test_progress_window_and_totals(user_id):
    today = date(2026, 6, 13)
    _log_on(user_id, today, "meal")
    _log_on(user_id, today, "workout")
    _log_on(user_id, today - timedelta(days=2), "water")
    _log_on(user_id, today - timedelta(days=20), "break")   # outside the weekly window

    wk = stats.compute_progress(user_id, 7, today)
    assert wk.days == 7 and len(wk.daily) == 7
    assert wk.start_date == (today - timedelta(days=6)).isoformat()
    assert wk.totals.meals == 1 and wk.totals.workouts == 1 and wk.totals.water == 1
    assert wk.totals.breaks == 0 and wk.active_days == 2

    mo = stats.compute_progress(user_id, 30, today)
    assert mo.totals.breaks == 1 and mo.active_days == 3 and mo.period_label == "Monthly"


def test_progress_uses_profile_name(user_id):
    p = store.get_profile(user_id)
    p.name = "Dr Patient"
    store.save_profile(user_id, p)
    assert stats.compute_progress(user_id, 7).patient_name == "Dr Patient"


def test_progress_renderers(user_id):
    p = stats.compute_progress(user_id, 7, date(2026, 6, 13))
    pdf, mt, fn = export_tool.render_progress(p, "pdf")
    assert pdf[:4] == b"%PDF" and mt == "application/pdf" and fn.endswith(".pdf")
    md, mt, fn = export_tool.render_progress(p, "md")
    assert b"# DevWell Progress Report" in md and fn.endswith(".md")


def test_report_endpoint_pdf(auth_client):
    auth_client.post("/log", json={"type": "workout", "detail": "run"})
    r = auth_client.get("/stats/report?period=weekly&format=pdf")
    assert r.status_code == 200 and r.content[:4] == b"%PDF"
    assert "attachment" in r.headers["content-disposition"]


def test_report_endpoint_markdown_monthly(auth_client):
    r = auth_client.get("/stats/report?period=monthly&format=md")
    assert r.status_code == 200 and b"# DevWell Progress Report" in r.content


def test_report_endpoint_bad_period(auth_client):
    assert auth_client.get("/stats/report?period=yearly").status_code == 400
