"""Thin wrapper around the Anthropic client.

Reads ANTHROPIC_API_KEY + CLAUDE_MODEL from the environment. If no key is set,
get_client() returns None and callers fall back to mock data — so the app runs
fine with or without a key.
"""
import os

_client = None


def ai_enabled() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def get_model() -> str:
    return os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")


def get_client():
    """Return a cached Anthropic client, or None if no key / SDK missing."""
    global _client
    if not ai_enabled():
        return None
    if _client is None:
        try:
            from anthropic import Anthropic
        except ImportError:
            return None
        _client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def complete(system: str, user: str, max_tokens: int = 2000) -> str:
    """Single-shot completion. Raises if no client is available — callers
    decide whether to catch and fall back to mock."""
    client = get_client()
    if client is None:
        raise RuntimeError("No Anthropic client (missing ANTHROPIC_API_KEY)")
    msg = client.messages.create(
        model=get_model(),
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in msg.content if getattr(block, "type", None) == "text")
