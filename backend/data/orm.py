"""SQLAlchemy ORM models backing the DevWell store."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey

from db import Base


class UserRow(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ProfileRow(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    name = Column(String, default="George")
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    diet = Column(String, default="No restrictions")
    fitness_level = Column(String, default="Intermediate")
    goal = Column(String, default="Stay healthy")
    screen_hours = Column(String, default="8-10")
    max_cook_time_min = Column(Integer, default=30)
    hydration_goal_l = Column(Float, default=2.5)
    sitting_break_interval_min = Column(Integer, default=45)
    allergies = Column(JSON, default=list)
    favorite_foods = Column(JSON, default=list)


class LogRow(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    detail = Column(String, default="")
    timestamp = Column(DateTime, nullable=True)
