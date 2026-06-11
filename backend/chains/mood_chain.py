"""Mood / stress helper chain.

Detects the user's emotional state from a short message and returns an
empathetic reply plus one breathing exercise and one physical reset.

Safety: the system prompt instructs the model to NOT respond with mere
"exercises" when a message suggests a mental-health crisis or self-harm —
instead it expresses care and encourages reaching out to a professional or
trusted person. Falls back to a gentle generic response on any failure.
"""
from clients import claude
from chains.jsonutil import extract_json
from models.schemas import MoodRequest, MoodResponse, MoodSuggestion

SYSTEM = (
    "You are a calm, supportive companion inside DevWell, helping developers with everyday "
    "work stress, frustration, and burnout. Read the user's message and infer their mood in "
    "one or two words. Reply with brief, warm empathy (1-2 sentences), then give one short "
    "breathing exercise and one quick physical reset they can do at their desk.\n"
    "IMPORTANT SAFETY: if the message suggests a mental-health crisis, severe depression, "
    "hopelessness, or any thought of self-harm, do NOT treat it as ordinary stress. In that "
    "case set mood to 'distress', make the reply gently express concern and encourage them to "
    "reach out to a mental-health professional or someone they trust (and a local crisis line "
    "if they're in danger), and keep the suggestions gentle grounding only.\n"
    "Always reply with valid JSON and nothing else."
)

_FALLBACK = MoodResponse(
    mood="stressed",
    reply="That sounds draining. Take a moment — you don't have to push through on empty.",
    breathing=MoodSuggestion(title="Box breathing", detail="Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times."),
    physical=MoodSuggestion(title="Stand & reset", detail="Stand up, roll your shoulders, and look out a window for 30 seconds."),
    generated_by="mock",
)


def detect_mood(req: MoodRequest) -> MoodResponse:
    if not claude.ai_enabled():
        return _FALLBACK
    try:
        user = (
            f'The user said: "{req.message}"\n'
            'Return JSON shaped exactly: {"mood": "frustrated", "reply": "...", '
            '"breathing": {"title": "...", "detail": "..."}, '
            '"physical": {"title": "...", "detail": "..."}}'
        )
        data = extract_json(claude.complete(SYSTEM, user, max_tokens=600))
        return MoodResponse(
            mood=data["mood"],
            reply=data["reply"],
            breathing=MoodSuggestion(**data["breathing"]),
            physical=MoodSuggestion(**data["physical"]),
            generated_by="claude",
        )
    except Exception:
        return _FALLBACK
