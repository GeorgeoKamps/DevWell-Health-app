"""Period progress report: computation, rendering, and endpoint."""
from datetime import date, datetime, timedelta

from data import store, stats
from tools import export_tool
from models.schemas import LogRequest


def _log_on(d: date, type_="meal"):
    store.add_log(LogRequest(type=type_, detail="x", timestamp=datetime(d.year, d.month, d.day, 9, 0)))


def test_progress_window_and_totals():
    today = date(2026, 6, 13)
    _log_on(today, "meal")
    _log_on(today, "workout")
    _log_on(today - timedelta(days=2), "water")
    _log_on(today - timedelta(days=20), "break")   # outside the weekly window

    wk = stats.compute_progress(7, today)
    assert wk.days == 7
    assert len(wk.daily) == 7
    assert wk.start_date == (today - timedelta(days=6)).isoformat()
    assert wk.end_date == today.isoformat()
    assert wk.totals.meals == 1 and wk.totals.workouts == 1 and wk.totals.water == 1
    assert wk.totals.breaks == 0          # the day-20 break is outside the week
    assert wk.active_days == 2            # today + day-2

    mo = stats.compute_progress(30, today)
    assert mo.totals.breaks == 1          # now inside the 30-day window
    assert mo.active_days == 3
    assert mo.period_label == "Monthly"


def test_progress_renderers():
    p = stats.compute_progress(7, date(2026, 6, 13))
    pdf, mt, fn = export_tool.render_progress(p, "pdf")
    assert pdf[:4] == b"%PDF" and mt == "application/pdf" and fn.endswith(".pdf")
    md, mt, fn = export_tool.render_progress(p, "md")
    assert b"# DevWell Progress Report" in md and fn.endswith(".md")


def test_progress_render_bad_format():
    import pytest
    p = stats.compute_progress(7, date(2026, 6, 13))
    with pytest.raises(ValueError):
        export_tool.render_progress(p, "xlsx")


def test_report_endpoint_pdf(client):
    client.post("/log", json={"type": "workout", "detail": "run"})
    r = client.get("/stats/report?period=weekly&format=pdf")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert "attachment" in r.headers["content-disposition"]
    assert r.content[:4] == b"%PDF"


def test_report_endpoint_markdown_monthly(client):
    r = client.get("/stats/report?period=monthly&format=md")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/markdown")
    assert b"# DevWell Progress Report" in r.content


def test_report_endpoint_bad_period(client):
    assert client.get("/stats/report?period=yearly").status_code == 400
