"""Meal-plan export tool + endpoint."""
import pytest
from models.schemas import MealPlanResponse, DayPlan
from tools import export_tool


def _plan():
    return MealPlanResponse(
        days=[
            DayPlan(day="Monday", breakfast="Oats 🥣", lunch="Wrap", dinner="Salmon", kcal=1800),
            DayPlan(day="Tuesday", breakfast="Yogurt", lunch="Bowl", dinner="Tofu", kcal=1750),
        ],
        shopping_list=["Oats (1kg)", "Salmon (400g)", "Tofu"],
        sources=["recipes/high_protein_quick.md"],
    )


def test_markdown_contains_plan_and_items():
    md = export_tool.plan_to_markdown(_plan())
    assert "# DevWell Meal Plan" in md
    assert "| Monday |" in md
    assert "- [ ] Oats (1kg)" in md
    assert "recipes/high_protein_quick.md" in md


def test_pdf_is_valid_bytes():
    pdf = export_tool.plan_to_pdf(_plan())
    assert isinstance(pdf, (bytes, bytearray))
    assert pdf[:4] == b"%PDF"        # valid PDF magic number
    assert len(pdf) > 500            # has real content


def test_render_dispatch_and_filenames():
    data, mt, fn = export_tool.render(_plan(), "pdf")
    assert mt == "application/pdf" and fn.endswith(".pdf")
    data, mt, fn = export_tool.render(_plan(), "md")
    assert mt == "text/markdown" and fn.endswith(".md")


def test_render_rejects_unknown_format():
    with pytest.raises(ValueError):
        export_tool.render(_plan(), "docx")


# ---- endpoint ----
def _payload():
    return _plan().model_dump()


def test_export_endpoint_pdf(client):
    r = client.post("/meal-plan/export?format=pdf", json=_payload())
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert "attachment" in r.headers["content-disposition"]
    assert r.content[:4] == b"%PDF"


def test_export_endpoint_markdown(client):
    r = client.post("/meal-plan/export?format=md", json=_payload())
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/markdown")
    assert b"# DevWell Meal Plan" in r.content


def test_export_endpoint_bad_format(client):
    r = client.post("/meal-plan/export?format=docx", json=_payload())
    assert r.status_code == 400
