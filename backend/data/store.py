"""Tiny in-memory store for the scaffold phase.

Swap for a real DB (SQLite/Postgres) later — the router code only touches
these helpers, so the change stays contained.
"""
from models.schemas import Profile, LogEntry, LogRequest

_profile = Profile()
_logs: list[LogEntry] = []


def get_profile() -> Profile:
    return _profile


def save_profile(profile: Profile) -> Profile:
    global _profile
    _profile = profile
    return _profile


def add_log(entry: LogRequest) -> LogEntry:
    log = LogEntry(id=len(_logs) + 1, **entry.model_dump())
    _logs.append(log)
    return log


def list_logs() -> list[LogEntry]:
    return _logs
