"""Persistent store backed by SQLite (via SQLAlchemy), scoped per user.

Each user has exactly one profile and their own activity log. Routers pass the
authenticated user's id; nothing here is global anymore.
"""
from datetime import datetime

from db import SessionLocal
from data.orm import ProfileRow, LogRow, UserRow
from models.schemas import Profile, LogEntry, LogRequest

_PROFILE_FIELDS = (
    "name", "age", "weight_kg", "height_cm", "diet", "fitness_level", "goal",
    "screen_hours", "max_cook_time_min", "hydration_goal_l",
    "sitting_break_interval_min", "allergies", "favorite_foods",
)


# ---- users ------------------------------------------------------------------
def get_user_by_email(email: str) -> UserRow | None:
    with SessionLocal() as db:
        row = db.query(UserRow).filter(UserRow.email == email.lower()).first()
        if row is not None:
            db.expunge(row)
        return row


def get_user(user_id: int) -> UserRow | None:
    with SessionLocal() as db:
        row = db.get(UserRow, user_id)
        if row is not None:
            db.expunge(row)
        return row


def create_user(email: str, password_hash: str, name: str = "") -> UserRow:
    """Create a user + their starter profile (named after them)."""
    with SessionLocal() as db:
        user = UserRow(email=email.lower(), password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        profile = ProfileRow(user_id=user.id, name=name or "there")
        db.add(profile)
        db.commit()
        db.expunge(user)
        return user


# ---- profile (one per user) -------------------------------------------------
def _row_to_profile(row: ProfileRow) -> Profile:
    data = {f: getattr(row, f) for f in _PROFILE_FIELDS}
    data["allergies"] = data["allergies"] or []
    data["favorite_foods"] = data["favorite_foods"] or []
    return Profile(**data)


def get_profile(user_id: int) -> Profile:
    with SessionLocal() as db:
        row = db.query(ProfileRow).filter(ProfileRow.user_id == user_id).first()
        if row is None:
            row = ProfileRow(user_id=user_id, **Profile().model_dump())
            db.add(row)
            db.commit()
            db.refresh(row)
        return _row_to_profile(row)


def save_profile(user_id: int, profile: Profile) -> Profile:
    data = profile.model_dump()
    with SessionLocal() as db:
        row = db.query(ProfileRow).filter(ProfileRow.user_id == user_id).first()
        if row is None:
            row = ProfileRow(user_id=user_id, **data)
            db.add(row)
        else:
            for k, v in data.items():
                setattr(row, k, v)
        db.commit()
        db.refresh(row)
        return _row_to_profile(row)


# ---- activity log (per user) ------------------------------------------------
def add_log(user_id: int, entry: LogRequest) -> LogEntry:
    with SessionLocal() as db:
        row = LogRow(
            user_id=user_id,
            type=entry.type,
            detail=entry.detail,
            timestamp=entry.timestamp or datetime.utcnow(),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return LogEntry(id=row.id, type=row.type, detail=row.detail, timestamp=row.timestamp)


def list_logs(user_id: int) -> list[LogEntry]:
    with SessionLocal() as db:
        rows = db.query(LogRow).filter(LogRow.user_id == user_id).order_by(LogRow.id).all()
        return [LogEntry(id=r.id, type=r.type, detail=r.detail, timestamp=r.timestamp) for r in rows]


def delete_log(user_id: int, log_id: int) -> bool:
    with SessionLocal() as db:
        row = db.get(LogRow, log_id)
        if row is None or row.user_id != user_id:
            return False
        db.delete(row)
        db.commit()
        return True
