"""AI-generated sitting-alert nudges.

The autonomous agent calls this when a break is due. Claude writes a fresh,
dev-themed nudge plus a quick desk micro-break (optionally grounded in the
exercise/ergonomics knowledge base). Falls back to the canned nudge pool when
there's no key or on any error.
"""
import random

from clients import claude
from chains.jsonutil import extract_json
from data import mock
from models.schemas import NudgeResponse, MicroBreak

try:
    from rag.retriever import retrieve
except Exception:  # pragma: no cover
    def retrieve(query, k=1):
        return []

SYSTEM = (
    "You are Byte 🐸, DevWell's witty health sidekick for developers who sit too long. "
    "Generate ONE short, funny, dev-themed nudge (a single sentence) telling the developer "
    "to get up and move, plus one quick desk-friendly micro-break they can do in a few "
    "minutes. Keep it light and specific. Reply with valid JSON and nothing else."
)


def _mock() -> NudgeResponse:
    return NudgeResponse(
        message=random.choice(mock.NUDGES),
        micro_break=MicroBreak(**random.choice(mock.MICRO_BREAKS)),
    )


def generate_nudge() -> NudgeResponse:
    if not claude.ai_enabled():
        return _mock()
    try:
        hits = retrieve("desk stretch micro break eye rest", k=1)
        context = hits[0]["text"] if hits else ""
        user = (
            'Return JSON shaped exactly: {"message": "...", '
            '"micro_break": {"title": "...", "detail": "..."}}'
            + (f"\nGround the micro-break in this reference if useful:\n{context}" if context else "")
        )
        data = extract_json(claude.complete(SYSTEM, user, max_tokens=300))
        return NudgeResponse(
            message=data["message"],
            micro_break=MicroBreak(**data["micro_break"]),
        )
    except Exception:
        return _mock()
