"""Persistent store backed by SQLite (via SQLAlchemy).

Same public interface as the old in-memory store — routers and chains call these
helpers and don't know about the DB. Profile is a single row (id=1); logs
accumulate in the `logs` table and survive restarts.
"""
from datetime import datetime

from db import SessionLocal
from data.orm import ProfileRow, LogRow
from models.schemas import Profile, LogEntry, LogRequest

PROFILE_ID = 1

_PROFILE_FIELDS = (
    "name", "age", "weight_kg", "height_cm", "diet", "fitness_level", "goal",
    "screen_hours", "max_cook_time_min", "hydration_goal_l",
    "sitting_break_interval_min", "allergies",
)


def _row_to_profile(row: ProfileRow) -> Profile:
    data = {f: getattr(row, f) for f in _PROFILE_FIELDS}
    data["allergies"] = data["allergies"] or []
    return Profile(**data)


def get_profile() -> Profile:
    with SessionLocal() as db:
        row = db.get(ProfileRow, PROFILE_ID)
        if row is None:
            row = ProfileRow(id=PROFILE_ID, **Profile().model_dump())
            db.add(row)
            db.commit()
            db.refresh(row)
        return _row_to_profile(row)


def save_profile(profile: Profile) -> Profile:
    data = profile.model_dump()
    with SessionLocal() as db:
        row = db.get(ProfileRow, PROFILE_ID)
        if row is None:
            row = ProfileRow(id=PROFILE_ID, **data)
            db.add(row)
        else:
            for k, v in data.items():
                setattr(row, k, v)
        db.commit()
        db.refresh(row)
        return _row_to_profile(row)


def add_log(entry: LogRequest) -> LogEntry:
    with SessionLocal() as db:
        row = LogRow(
            type=entry.type,
            detail=entry.detail,
            timestamp=entry.timestamp or datetime.utcnow(),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return LogEntry(id=row.id, type=row.type, detail=row.detail, timestamp=row.timestamp)


def list_logs() -> list[LogEntry]:
    with SessionLocal() as db:
        rows = db.query(LogRow).order_by(LogRow.id).all()
        return [LogEntry(id=r.id, type=r.type, detail=r.detail, timestamp=r.timestamp) for r in rows]


def delete_log(log_id: int) -> bool:
    """Delete a log by id. Returns True if a row was removed."""
    with SessionLocal() as db:
        row = db.get(LogRow, log_id)
        if row is None:
            return False
        db.delete(row)
        db.commit()
        return True


def clear_logs(log_type: str | None = None) -> int:
    """Delete log entries — all of them, or just one category (water/meal/
    workout/break). Returns how many were removed."""
    with SessionLocal() as db:
        q = db.query(LogRow)
        if log_type:
            q = q.filter(LogRow.type == log_type)
        n = q.delete()
        db.commit()
        return n
