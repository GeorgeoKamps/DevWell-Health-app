"""Health-chat response generation.

Uses Claude with a DevWell-specific system prompt (the "Byte" persona) and the
recent conversation history. Falls back to a canned reply if no key / on error.
"""
from clients import claude
from data import mock
from models.schemas import ChatRequest, ChatResponse

SYSTEM = (
    "You are Byte 🐸, the friendly health companion inside DevWell — an app for developers "
    "who sit for long hours. You help with nutrition, quick workouts, ergonomics, eye care, "
    "hydration, sleep, and managing stress while coding.\n"
    "Style: warm, practical, and concise (2-4 short sentences unless asked for detail). "
    "Give specific, actionable suggestions a busy dev can do at their desk. Use the occasional "
    "light dev metaphor, but don't overdo the jokes.\n"
    "Safety: you are not a doctor. For anything that sounds like a medical condition, injury, or "
    "mental-health crisis, gently suggest they speak with a professional."
)

MAX_HISTORY = 10


def _mock(req: ChatRequest) -> ChatResponse:
    reply = f'You asked: "{req.message}". {mock.CHAT_CANNED}'
    return ChatResponse(reply=reply, sources=[], generated_by="mock")


def generate_reply(req: ChatRequest) -> ChatResponse:
    if not claude.ai_enabled():
        return _mock(req)
    try:
        # Build the message list from recent history; the API must start with a user turn.
        msgs = [{"role": m.role, "content": m.text} for m in req.history[-MAX_HISTORY:]]
        while msgs and msgs[0]["role"] != "user":
            msgs.pop(0)
        msgs.append({"role": "user", "content": req.message})
        reply = claude.chat(SYSTEM, msgs, max_tokens=600)
        return ChatResponse(reply=reply.strip(), sources=[], generated_by="claude")
    except Exception:
        return _mock(req)
