"""Mood / stress helper chain — RAG-grounded.

Detects the user's emotional state and returns an empathetic reply plus one
breathing exercise and one physical reset, grounded in the mental-wellness
knowledge base. Retrieval is local, so the *offline* fallback is also relevant:
it infers the mood from keywords and grounds its tip in the matching KB doc
(instead of one fixed canned reply).

Safety: if a message suggests a mental-health crisis or self-harm, both the AI
prompt and the offline fallback respond with care and encourage reaching out to
a professional — they do NOT just hand back "exercises".
"""
import re

from clients import claude
from chains.jsonutil import extract_json
from models.schemas import MoodRequest, MoodResponse, MoodSuggestion

try:
    from rag.retriever import retrieve, read_doc
except Exception:  # pragma: no cover
    def retrieve(query, k=2):
        return []

    def read_doc(source):
        return None

SYSTEM = (
    "You are Byte 🐸, a calm, supportive companion inside DevWell, helping developers with "
    "everyday work stress, frustration, and burnout. Read the user's message and infer their "
    "mood in one or two words. Reply with brief, warm empathy (1-2 sentences), then give one "
    "short breathing exercise and one quick physical reset they can do at their desk. Prefer the "
    "reference snippets below when relevant.\n"
    "IMPORTANT SAFETY: if the message suggests a mental-health crisis, severe depression, "
    "hopelessness, or any thought of self-harm, do NOT treat it as ordinary stress. In that "
    "case set mood to 'distress', make the reply gently express concern and encourage them to "
    "reach out to a mental-health professional or someone they trust (and a local crisis line "
    "if they're in danger), and keep the suggestions gentle grounding only.\n"
    "Always reply with valid JSON and nothing else."
)

# --- offline mood detection (first match wins) ---
_DISTRESS = re.compile(r"\b(hopeless|worthless|self[\s-]?harm|suicid|kill myself|end it all|can'?t go on|don'?t want to live)\b", re.I)
_MOODS = [
    (re.compile(r"\b(anxious|anxiety|panic|panicky|nervous|worried|on edge)\b", re.I), "anxious", "mental_wellness/stress_and_focus.md"),
    (re.compile(r"\b(exhaust|exhausted|drained|burn(t|ed)?\s?out|burnout|no energy|fatigue|so tired|knackered)\b", re.I), "burnt out", "mental_wellness/sleep.md"),
    (re.compile(r"\b(tired|sleepy|can'?t sleep|insomnia)\b", re.I), "tired", "mental_wellness/sleep.md"),
    (re.compile(r"\b(frustrat\w*|stuck|angry|annoyed|irritat\w*|rage|this bug)\b", re.I), "frustrated", "mental_wellness/stress_and_focus.md"),
    (re.compile(r"\b(sad|down|low|unmotivated|demotivat\w*|lonely|meh)\b", re.I), "low", "mental_wellness/stress_and_focus.md"),
    (re.compile(r"\b(can'?t focus|distract\w*|scattered|brain fog|foggy|unfocused)\b", re.I), "unfocused", "mental_wellness/stress_and_focus.md"),
    (re.compile(r"\b(stress\w*|pressure|deadline|too much|overwhelm\w*|swamped)\b", re.I), "stressed", "mental_wellness/stress_and_focus.md"),
]

_EMPATHY = {
    "anxious": "That anxious, on-edge feeling is real — let's slow it down a notch.",
    "burnt out": "Running on empty is your body asking for a real pause, not more grind.",
    "tired": "Tired brains write tired code — a reset will help more than pushing on.",
    "frustrated": "Frustration usually means you care and you're close. Let's clear your head.",
    "low": "Some days just feel heavy. Be a little kinder to yourself right now.",
    "unfocused": "A scattered mind is normal after hours of context-switching. Let's refocus.",
    "stressed": "That sounds draining — you don't have to push through on empty.",
}

_BREATHING = {
    "anxious": MoodSuggestion(title="4-7-8 breathing", detail="Inhale 4s, hold 7s, exhale slowly 8s. Repeat 4 times — it calms the nervous system fast."),
    "burnt out": MoodSuggestion(title="Box breathing", detail="Inhale 4s, hold 4s, exhale 4s, hold 4s. Four rounds to steady yourself."),
    "tired": MoodSuggestion(title="Energizing breath", detail="Three quick deep breaths in through the nose, long exhale out the mouth. Wakes you up."),
    "frustrated": MoodSuggestion(title="Box breathing", detail="Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times to drop the tension."),
    "low": MoodSuggestion(title="Slow exhale breathing", detail="Breathe in 4s, out 6s, for a minute. Longer exhales gently lift your mood."),
    "unfocused": MoodSuggestion(title="Box breathing", detail="Inhale 4s, hold 4s, exhale 4s, hold 4s, ×4. Resets a scattered mind."),
    "stressed": MoodSuggestion(title="Box breathing", detail="Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times."),
}

_PHYSICAL = {
    "anxious": MoodSuggestion(title="Ground yourself", detail="Plant both feet, press palms on the desk, and name 5 things you can see. Brings you back to now."),
    "burnt out": MoodSuggestion(title="Step away fully", detail="Leave the desk for 5 minutes — water, daylight, no screen. A real micro-break."),
    "tired": MoodSuggestion(title="Quick walk", detail="Stand and walk for 2 minutes, then 10 shoulder rolls. Gets the blood moving."),
    "frustrated": MoodSuggestion(title="Stand & shake it out", detail="Stand up, roll your shoulders, shake out your hands, look out a window for 30s."),
    "low": MoodSuggestion(title="Sunlight + stretch", detail="Get to a window or step outside, take a slow full-body stretch overhead."),
    "unfocused": MoodSuggestion(title="20-20-20 reset", detail="Look 20 feet away for 20 seconds, then stand and stretch before the next task."),
    "stressed": MoodSuggestion(title="Stand & reset", detail="Stand up, roll your shoulders, and look out a window for 30 seconds."),
}


def _summarise(text: str, limit: int = 240) -> str:
    t = re.sub(r"^#+\s*", "", text.strip(), flags=re.MULTILINE)
    t = re.sub(r"^[-*]\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"[ \t]+", " ", t).strip()
    if len(t) > limit:
        cut = t[:limit].rsplit(". ", 1)[0].strip()
        t = (cut + ".") if len(cut) > 60 else t[:limit].rstrip() + "…"
    return t


def _detect(message: str):
    for rx, mood, src in _MOODS:
        if rx.search(message):
            return mood, src
    return "stressed", "mental_wellness/stress_and_focus.md"


def _kb_tip(src, hits) -> str:
    # The doc's intro reads cleanest; fall back to a retrieved chunk from it.
    doc = read_doc(src)
    if doc:
        return _summarise(doc["text"])
    for h in hits:
        if h["source"] == src:
            return _summarise(h["text"])
    return ""


def _mock(req: MoodRequest, hits, sources) -> MoodResponse:
    # Safety first: a distress message gets care, not "exercises".
    if _DISTRESS.search(req.message):
        return MoodResponse(
            mood="distress",
            reply=("I'm really sorry you're feeling this way, and I'm glad you said something. "
                   "This is more than I can help with as an app — please reach out to a mental-health "
                   "professional or someone you trust. If you might be in danger, contact a local crisis "
                   "line right now. You don't have to go through this alone."),
            breathing=MoodSuggestion(title="Gentle grounding", detail="Breathe slowly and feel your feet on the floor. Just stay with the next breath."),
            physical=MoodSuggestion(title="Reach out", detail="Message or call one person you trust and let them know how you're feeling."),
            sources=sources,
            generated_by="mock",
        )

    mood, src = _detect(req.message)
    tip = _kb_tip(src, hits)
    reply = _EMPATHY[mood]
    if tip:
        reply += f" Here's what DevWell's guide on {src.split('/')[-1].replace('.md','').replace('_',' ')} suggests: {tip}"
    cited = [src] + [s for s in sources if s != src]
    return MoodResponse(
        mood=mood,
        reply=reply,
        breathing=_BREATHING[mood],
        physical=_PHYSICAL[mood],
        sources=cited,
        generated_by="mock",
    )


def detect_mood(req: MoodRequest) -> MoodResponse:
    try:
        hits = retrieve(f"{req.message} stress focus mental wellness", k=3)
    except Exception:
        hits = []
    sources = list(dict.fromkeys(h["source"] for h in hits))

    if not claude.ai_enabled():
        return _mock(req, hits, sources)
    try:
        context = "\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)
        system = SYSTEM + (f"\n\n--- Knowledge base snippets ---\n{context}" if context else "")
        user = (
            f'The user said: "{req.message}"\n'
            'Return JSON shaped exactly: {"mood": "frustrated", "reply": "...", '
            '"breathing": {"title": "...", "detail": "..."}, '
            '"physical": {"title": "...", "detail": "..."}}'
        )
        data = extract_json(claude.complete(system, user, max_tokens=600))
        return MoodResponse(
            mood=data["mood"],
            reply=data["reply"],
            breathing=MoodSuggestion(**data["breathing"]),
            physical=MoodSuggestion(**data["physical"]),
            sources=sources,
            generated_by="claude",
        )
    except Exception:
        return _mock(req, hits, sources)
