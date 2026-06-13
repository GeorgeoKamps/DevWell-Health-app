"""Export a generated meal plan to a downloadable file.

Two formats:
  * Markdown — dependency-free, always available.
  * PDF      — rendered with fpdf2 (a light, pure-Python lib).

This is DevWell's "tool use" surface: the meal-plan feature produces structured
data, and this tool turns it into something the user can take to the shops.
"""
from __future__ import annotations

from datetime import date

from models.schemas import MealPlanResponse

_DAY_HEADERS = ("Breakfast", "Lunch", "Dinner")


def _ascii(s: str) -> str:
    """fpdf2's core fonts are latin-1 only; drop anything they can't encode
    (e.g. emoji) so a fancy recipe name never crashes the export."""
    return str(s).encode("latin-1", "replace").decode("latin-1")


# ---------------------------------------------------------------- markdown ---
def plan_to_markdown(plan: MealPlanResponse) -> str:
    lines: list[str] = []
    lines.append("# DevWell Meal Plan")
    lines.append(f"_Generated {date.today().isoformat()} · {len(plan.days)}-day plan_")
    lines.append("")

    lines.append("## Weekly Plan")
    lines.append("")
    lines.append("| Day | Breakfast | Lunch | Dinner | kcal |")
    lines.append("| --- | --- | --- | --- | --- |")
    for d in plan.days:
        lines.append(f"| {d.day} | {d.breakfast} | {d.lunch} | {d.dinner} | {d.kcal} |")
    lines.append("")

    lines.append("## Shopping List")
    lines.append("")
    for item in plan.shopping_list:
        lines.append(f"- [ ] {item}")
    lines.append("")

    if plan.sources:
        lines.append("## Sources")
        lines.append("")
        for s in plan.sources:
            lines.append(f"- {s}")
        lines.append("")

    return "\n".join(lines)


# --------------------------------------------------------------------- pdf ---
def plan_to_pdf(plan: MealPlanResponse) -> bytes:
    from fpdf import FPDF

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # --- title ---
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "DevWell Meal Plan", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 6, _ascii(f"Generated {date.today().isoformat()} - {len(plan.days)}-day plan"),
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    # --- weekly plan ---
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Weekly Plan", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)
    for d in plan.days:
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 6, _ascii(f"{d.day}  -  {d.kcal} kcal"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        for label, meal in zip(_DAY_HEADERS, (d.breakfast, d.lunch, d.dinner)):
            pdf.cell(24, 5, _ascii(label), new_x="RIGHT", new_y="TOP")
            pdf.multi_cell(0, 5, _ascii(meal), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    # --- shopping list ---
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Shopping List", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for item in plan.shopping_list:
        pdf.cell(6, 6, _ascii("[ ]"), new_x="RIGHT", new_y="TOP")
        pdf.multi_cell(0, 6, _ascii(item), new_x="LMARGIN", new_y="NEXT")

    # --- sources ---
    if plan.sources:
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, "Sources", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(120, 120, 120)
        for s in plan.sources:
            pdf.multi_cell(0, 5, _ascii(s), new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())


# ------------------------------------------------------------------ helpers ---
def render(plan: MealPlanResponse, fmt: str) -> tuple[bytes, str, str]:
    """Return (data, media_type, filename) for the requested format."""
    stamp = date.today().isoformat()
    if fmt == "pdf":
        return plan_to_pdf(plan), "application/pdf", f"devwell-meal-plan-{stamp}.pdf"
    if fmt in ("md", "markdown"):
        return plan_to_markdown(plan).encode("utf-8"), "text/markdown", f"devwell-meal-plan-{stamp}.md"
    raise ValueError(f"unsupported format: {fmt!r}")
