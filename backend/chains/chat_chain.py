"""Health-chat response generation — RAG-powered.

Retrieves relevant snippets from the DevWell knowledge base and grounds Claude's
answer in them (with citations). The "Byte" persona + recent history are used for
a natural multi-turn conversation.

When the AI layer isn't available (no key / network / error) we still give a
*relevant* answer: light keyword intent-routing picks the best knowledge-base
doc for the question (with plain retrieval as a fallback). Retrieval is local and
needs no API key, so answers stay on-topic and sources are cited even offline.
"""
import re

from clients import claude
from data import mock
from models.schemas import ChatRequest, ChatResponse

try:
    from rag.retriever import retrieve, read_doc
except Exception:  # pragma: no cover
    def retrieve(query, k=3):
        return []

    def read_doc(source):
        return None

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

# Keyword → best knowledge-base doc, checked in order (first match wins).
_INTENTS = [
    (r"\b(gym|workout|work\s?out|exercise|exercises|strength|upper\s?body|lower\s?body|push[\s-]?up|pull[\s-]?up|squat|lunge|abs|core|biceps|chest|cardio|hiit)\b", "exercises/quick_workouts.md"),
    (r"\b(stretch|stretches|posture|neck|shoulders?|wrist|hips?|stiff|sore back|lower back)\b", "exercises/desk_stretches.md"),
    (r"\b(water|hydrate|hydration|drink|thirsty|dehydrat)\b", "ergonomics/hydration.md"),
    (r"\b(eye|eyes|screen|vision|blur|blurry|20-20-20)\b", "ergonomics/eye_care.md"),
    (r"\b(desk|chair|monitor|ergonomic|ergonomics|setup|sitting|sit)\b", "ergonomics/desk_setup.md"),
    (r"\b(sleep|insomnia|tired|rest|bedtime|melatonin)\b", "mental_wellness/sleep.md"),
    (r"\b(stress|stressed|anxious|anxiety|overwhelm|focus|burnout|calm|breathe|breathing|deadline)\b", "mental_wellness/stress_and_focus.md"),
    (r"\b(coffee|caffeine|energy|crash|slump|alert)\b", "mental_wellness/energy_and_caffeine.md"),
    (r"\b(snack|snacks)\b", "recipes/healthy_snacks.md"),
    (r"\b(vegetarian|vegan|veggie|dinner|dinners)\b", "recipes/vegetarian_dinners.md"),
    (r"\b(meal|meals|eat|food|recipe|recipes|protein|breakfast|lunch|cook|cooking)\b", "recipes/high_protein_quick.md"),
]


def _nice_source(source: str) -> str:
    return source.split("/")[-1].replace(".md", "").replace("_", " ")


def _intent_source(message: str) -> str | None:
    msg = message.lower()
    for pattern, source in _INTENTS:
        if re.search(pattern, msg):
            return source
    return None


def _summarise(text: str, limit: int = 520) -> str:
    """Turn a raw knowledge-base chunk into a clean, readable answer."""
    t = re.sub(r"^#+\s*", "", text.strip(), flags=re.MULTILINE)   # drop markdown headers
    t = re.sub(r"^[-*]\s*", "• ", t, flags=re.MULTILINE)          # tidy bullets
    t = re.sub(r"[ \t]+", " ", t).strip()
    if len(t) > limit:
        cut = t[:limit].rsplit(". ", 1)[0].strip()
        t = (cut + ".") if len(cut) > 80 else t[:limit].rstrip() + "…"
    return t


def _best_passage(req: ChatRequest, hits):
    """Pick the most relevant source for the question: intent-matched doc first,
    else the top retrieved hit."""
    src = _intent_source(req.message)
    if src:
        for h in hits:                       # prefer the retrieved chunk from that doc
            if h["source"] == src:
                return h["text"], src
        doc = read_doc(src)                  # else read the doc directly
        if doc:
            return doc["text"], src
    if hits:
        return hits[0]["text"], hits[0]["source"]
    return None, None


def _mock(req: ChatRequest, sources, hits) -> ChatResponse:
    """Relevant, key-free answer built from the best-matching KB passage."""
    text, src = _best_passage(req, hits)
    if text:
        reply = f"Here's what DevWell's guide on {_nice_source(src)} suggests:\n\n{_summarise(text)}"
        cited = [src] + [s for s in sources if s != src]
        return ChatResponse(reply=reply, sources=cited, generated_by="mock")
    return ChatResponse(reply=mock.CHAT_CANNED, sources=sources, generated_by="mock")


def generate_reply(req: ChatRequest) -> ChatResponse:
    # Retrieval is local (no key needed) — do it regardless of AI availability.
    try:
        hits = retrieve(req.message, k=3)
    except Exception:
        hits = []
    sources = list(dict.fromkeys(h["source"] for h in hits))

    if not claude.ai_enabled():
        return _mock(req, sources, hits)
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
        return _mock(req, sources, hits)
