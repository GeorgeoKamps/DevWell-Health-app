"""Health-chat response generation — RAG-powered.

Retrieves relevant snippets from the DevWell knowledge base and grounds Claude's
answer in them (with citations). The "Byte" persona + recent history are used for
a natural multi-turn conversation. Falls back to a canned reply on no key / error.
Retrieval runs locally and needs no API key, so sources are returned even in mock
mode.
"""
from clients import claude
from data import mock
from models.schemas import ChatRequest, ChatResponse

try:
    from rag.retriever import retrieve
except Exception:  # pragma: no cover
    def retrieve(query, k=3):
        return []

SYSTEM = (
    "You are Byte 🐸, the friendly health companion inside DevWell — an app for developers "
    "who sit for long hours. You help with nutrition, quick workouts, ergonomics, eye care, "
    "hydration, sleep, and managing stress while coding.\n"
    "Style: warm, practical, and concise (2-4 short sentences unless asked for detail). "
    "Give specific, actionable suggestions a busy dev can do at their desk.\n"
    "Grounding: prefer the reference snippets provided below when they're relevant, and you "
    "may mention the gist of them. If they don't apply, answer from general knowledge.\n"
    "Safety: you are not a doctor. For anything that sounds like a medical condition, injury, "
    "or mental-health crisis, gently suggest they speak with a professional."
)

MAX_HISTORY = 10


def _mock(req: ChatRequest, sources) -> ChatResponse:
    reply = f'You asked: "{req.message}". {mock.CHAT_CANNED}'
    return ChatResponse(reply=reply, sources=sources, generated_by="mock")


def generate_reply(req: ChatRequest) -> ChatResponse:
    # Retrieval is local (no key needed) — do it regardless of AI availability.
    try:
        hits = retrieve(req.message, k=3)
    except Exception:
        hits = []
    sources = list(dict.fromkeys(h["source"] for h in hits))

    if not claude.ai_enabled():
        return _mock(req, sources)
    try:
        context = "\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)
        system = SYSTEM + (f"\n\n--- Knowledge base snippets ---\n{context}" if context else "")
        msgs = [{"role": m.role, "content": m.text} for m in req.history[-MAX_HISTORY:]]
        while msgs and msgs[0]["role"] != "user":
            msgs.pop(0)
        msgs.append({"role": "user", "content": req.message})
        reply = claude.chat(system, msgs, max_tokens=600)
        return ChatResponse(reply=reply.strip(), sources=sources, generated_by="claude")
    except Exception:
        return _mock(req, sources)
