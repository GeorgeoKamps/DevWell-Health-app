"""Meal-plan export tool + endpoint."""
import pytest
from models.schemas import MealPlanResponse, DayPlan
from tools import export_tool


def _plan():
    return MealPlanResponse(
        days=[DayPlan(day="Monday", breakfast="Oats 🥣", lunch="Wrap", dinner="Salmon", kcal=1800)],
        shopping_list=["Oats (1kg)", "Salmon (400g)"],
        sources=["recipes/high_protein_quick.md"],
    )


def test_markdown_contains_plan_and_items():
    md = export_tool.plan_to_markdown(_plan())
    assert "# DevWell Meal Plan" in md and "| Monday |" in md and "- [ ] Oats (1kg)" in md


def test_pdf_is_valid_bytes():
    pdf = export_tool.plan_to_pdf(_plan())
    assert pdf[:4] == b"%PDF" and len(pdf) > 500


def test_render_dispatch_and_filenames():
    _, mt, fn = export_tool.render(_plan(), "pdf")
    assert mt == "application/pdf" and fn.endswith(".pdf")
    _, mt, fn = export_tool.render(_plan(), "md")
    assert mt == "text/markdown" and fn.endswith(".md")


def test_render_rejects_unknown_format():
    with pytest.raises(ValueError):
        export_tool.render(_plan(), "docx")


def test_export_endpoint_pdf(auth_client):
    r = auth_client.post("/meal-plan/export?format=pdf", json=_plan().model_dump())
    assert r.status_code == 200 and r.content[:4] == b"%PDF"
    assert "attachment" in r.headers["content-disposition"]


def test_export_endpoint_markdown(auth_client):
    r = auth_client.post("/meal-plan/export?format=md", json=_plan().model_dump())
    assert r.status_code == 200 and b"# DevWell Meal Plan" in r.content


def test_export_endpoint_bad_format(auth_client):
    assert auth_client.post("/meal-plan/export?format=docx", json=_plan().model_dump()).status_code == 400


def test_export_requires_auth(client):
    assert client.post("/meal-plan/export?format=pdf", json=_plan().model_dump()).status_code == 401
