"""Export generated DevWell content to downloadable files.

Formats:
  * Markdown — dependency-free, always available.
  * PDF      — rendered with fpdf2 (a light, pure-Python lib).

This is DevWell's "tool use" surface: features produce structured data, and
these helpers turn it into something the user can take to the shops — or to
their doctor.
"""
from __future__ import annotations

from datetime import date

from models.schemas import MealPlanResponse

_DAY_HEADERS = ("Breakfast", "Lunch", "Dinner")


def _ascii(s) -> str:
    """fpdf2's core fonts are latin-1 only; drop anything they can't encode
    (e.g. emoji) so a fancy recipe name never crashes the export."""
    return str(s).encode("latin-1", "replace").decode("latin-1")


# ============================================================ MEAL PLAN ======
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


def plan_to_pdf(plan: MealPlanResponse) -> bytes:
    from fpdf import FPDF

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "DevWell Meal Plan", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 6, _ascii(f"Generated {date.today().isoformat()} - {len(plan.days)}-day plan"),
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

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

    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Shopping List", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for item in plan.shopping_list:
        pdf.cell(6, 6, _ascii("[ ]"), new_x="RIGHT", new_y="TOP")
        pdf.multi_cell(0, 6, _ascii(item), new_x="LMARGIN", new_y="NEXT")

    if plan.sources:
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, "Sources", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(120, 120, 120)
        for s in plan.sources:
            pdf.multi_cell(0, 5, _ascii(s), new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())


def render(plan: MealPlanResponse, fmt: str) -> tuple[bytes, str, str]:
    """Return (data, media_type, filename) for the requested meal-plan format."""
    stamp = date.today().isoformat()
    if fmt == "pdf":
        return plan_to_pdf(plan), "application/pdf", f"devwell-meal-plan-{stamp}.pdf"
    if fmt in ("md", "markdown"):
        return plan_to_markdown(plan).encode("utf-8"), "text/markdown", f"devwell-meal-plan-{stamp}.md"
    raise ValueError(f"unsupported format: {fmt!r}")


# ======================================================= PROGRESS REPORT =====
def progress_to_markdown(p) -> str:
    lines = [
        "# DevWell Progress Report",
        f"**Patient:** {p.patient_name}  ",
        f"**Period:** {p.period_label} ({p.start_date} to {p.end_date}, {p.days} days)  ",
        "",
        "## Summary",
        "",
        f"- Current streak: **{p.current_streak} days**",
        f"- Longest streak: **{p.longest_streak} days**",
        f"- Active days this period: **{p.active_days} / {p.days}**",
        f"- Meals logged: **{p.totals.meals}**",
        f"- Workouts: **{p.totals.workouts}**",
        f"- Water intakes: **{p.totals.water}** (~{p.totals.water * 250} ml)",
        f"- Movement breaks: **{p.totals.breaks}**",
        "",
        "## Daily Activity",
        "",
        "| Date | Meals | Workouts | Water | Breaks | Total |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for d in p.daily:
        lines.append(f"| {d.date} | {d.meals} | {d.workouts} | {d.water} | {d.breaks} | {d.total} |")
    lines.append("")
    lines.append("_Generated by DevWell. Self-reported activity data — not a medical record._")
    lines.append("")
    return "\n".join(lines)


def progress_to_pdf(p) -> bytes:
    from fpdf import FPDF

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "DevWell Progress Report", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, _ascii(f"Patient: {p.patient_name}"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(120, 120, 120)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, _ascii(f"Period: {p.period_label}  ({p.start_date} to {p.end_date}, {p.days} days)"),
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(3)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Summary", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for line in (
        f"Current streak: {p.current_streak} days",
        f"Longest streak: {p.longest_streak} days",
        f"Active days this period: {p.active_days} / {p.days}",
        f"Meals logged: {p.totals.meals}",
        f"Workouts: {p.totals.workouts}",
        f"Water intakes: {p.totals.water}  (~{p.totals.water * 250} ml)",
        f"Movement breaks: {p.totals.breaks}",
    ):
        pdf.cell(0, 6, _ascii(f"- {line}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Daily Activity", new_x="LMARGIN", new_y="NEXT")
    headers = ["Date", "Meals", "Workouts", "Water", "Breaks", "Total"]
    widths = [40, 24, 28, 22, 24, 22]
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(238, 238, 238)
    for h, w in zip(headers, widths):
        pdf.cell(w, 7, _ascii(h), border=1, fill=True, align="C")
    pdf.ln(7)
    pdf.set_font("Helvetica", "", 9)
    for d in p.daily:
        fill = d.total > 0
        if fill:
            pdf.set_fill_color(247, 252, 247)
        for val, w in zip([d.date, d.meals, d.workouts, d.water, d.breaks, d.total], widths):
            pdf.cell(w, 6, _ascii(str(val)), border=1, fill=fill, align="C")
        pdf.ln(6)

    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(140, 140, 140)
    pdf.multi_cell(0, 4, _ascii("Generated by DevWell. Self-reported activity data - not a medical record."))

    return bytes(pdf.output())


def render_progress(p, fmt: str) -> tuple[bytes, str, str]:
    """Return (data, media_type, filename) for a progress report."""
    label = p.period_label.lower()
    if fmt == "pdf":
        return progress_to_pdf(p), "application/pdf", f"devwell-progress-{label}-{p.end_date}.pdf"
    if fmt in ("md", "markdown"):
        return progress_to_markdown(p).encode("utf-8"), "text/markdown", f"devwell-progress-{label}-{p.end_date}.md"
    raise ValueError(f"unsupported format: {fmt!r}")
