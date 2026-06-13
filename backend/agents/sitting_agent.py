"""Autonomous sitting-alert agent state.

Single-user, in-process state machine. The frontend sends heartbeats so the
agent knows the user is active; when they've been sitting longer than their
break interval, `break_due()` returns True and the SSE stream pushes a nudge.
`took_break()` resets the cycle. If a pushed nudge is ignored past a grace
period, the agent re-arms and counts the ignore (per the spec's "log the break
— or log that it was ignored").
"""
import time

ACTIVE_WINDOW = 120  # seconds — "active" if a heartbeat arrived within this

_state = {
    "last_active": 0.0,
    "last_break": time.time(),
    "nudged": False,
    "nudged_at": 0.0,
    "ignored": 0,
}


def heartbeat() -> None:
    _state["last_active"] = time.time()


def took_break() -> None:
    _state["last_break"] = time.time()
    _state["nudged"] = False


def is_active() -> bool:
    return (time.time() - _state["last_active"]) < ACTIVE_WINDOW


def seconds_until_break(interval_sec: int) -> int:
    return max(0, int(interval_sec - (time.time() - _state["last_break"])))


def break_due(interval_sec: int) -> bool:
    return is_active() and (time.time() - _state["last_break"]) >= interval_sec


def already_nudged() -> bool:
    return _state["nudged"]


def mark_nudged() -> None:
    _state["nudged"] = True
    _state["nudged_at"] = time.time()


def ignored_due(grace_sec: int) -> bool:
    """A nudge was pushed but not acted on within the grace period."""
    return _state["nudged"] and is_active() and (time.time() - _state["nudged_at"]) >= grace_sec


def rearm_after_ignore() -> None:
    """Count the ignore and reset the cycle so the agent nudges again later."""
    _state["ignored"] += 1
    _state["last_break"] = time.time()
    _state["nudged"] = False


def snapshot(interval_sec: int) -> dict:
    return {
        "active": is_active(),
        "seconds_until_break": seconds_until_break(interval_sec),
        "nudged": _state["nudged"],
        "ignored": _state["ignored"],
    }
