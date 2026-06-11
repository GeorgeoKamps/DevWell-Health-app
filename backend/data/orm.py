"""SQLAlchemy ORM models backing the DevWell store."""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON

from db import Base


class ProfileRow(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True)  # single profile, always id=1
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


class LogRow(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String, nullable=False)
    detail = Column(String, default="")
    timestamp = Column(DateTime, nullable=True)
