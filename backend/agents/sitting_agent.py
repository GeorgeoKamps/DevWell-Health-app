"""Autonomous sitting-alert agent state.

Single-user, in-process state machine. The frontend sends heartbeats so the
agent knows the user is active; when they've been sitting longer than their
break interval, `break_due()` returns True and the SSE stream pushes a nudge.
Calling `took_break()` resets the cycle.
"""
import time

ACTIVE_WINDOW = 120  # seconds — considered "active" if a heartbeat arrived within this

_state = {
    "last_active": 0.0,   # last heartbeat
    "last_break": time.time(),
    "nudged": False,      # already pushed a nudge for the current cycle?
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


def snapshot(interval_sec: int) -> dict:
    return {
        "active": is_active(),
        "seconds_until_break": seconds_until_break(interval_sec),
        "nudged": _state["nudged"],
    }
