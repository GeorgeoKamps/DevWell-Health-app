"""Pydantic request/response models for the DevWell API.

Response shapes deliberately mirror what the React frontend already renders,
so wiring the UI to these endpoints later is a drop-in change.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ----- Profile ---------------------------------------------------------------
class Profile(BaseModel):
    name: str = "George"
    diet: str = Field("balanced", description="e.g. vegetarian, vegan, keto, balanced")
    fitness_level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    work_schedule: str = Field("9-5 desk job", description="free text about the user's day")
    max_cook_time_min: int = 30
    hydration_goal_l: float = 2.5
    sitting_break_interval_min: int = 45
    allergies: list[str] = []


# ----- Meal plan -------------------------------------------------------------
class MealPlanRequest(BaseModel):
    diet: str = "balanced"
    max_cook_time_min: int = 30
    days: int = 7
    people: int = 1


class DayPlan(BaseModel):
    day: str
    breakfast: str
    lunch: str
    dinner: str
    kcal: int


class MealPlanResponse(BaseModel):
    days: list[DayPlan]
    shopping_list: list[str]
    generated_by: str = "mock"


# ----- Workout ---------------------------------------------------------------
class WorkoutRequest(BaseModel):
    available_minutes: int = 20
    focus: str = Field("full body", description="e.g. 'back pain', 'energy', 'stretch'")
    level: Literal["easy", "medium", "hard"] = "easy"


class Exercise(BaseModel):
    name: str
    sets: str


class WorkoutResponse(BaseModel):
    title: str
    duration_min: int
    level: str
    exercises: list[Exercise]
    generated_by: str = "mock"


# ----- Chat ------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []
    generated_by: str = "mock"


# ----- Nudge -----------------------------------------------------------------
class MicroBreak(BaseModel):
    title: str
    detail: str


class NudgeResponse(BaseModel):
    message: str
    micro_break: MicroBreak
    interval_min: int = 45


# ----- Activity log ----------------------------------------------------------
class LogRequest(BaseModel):
    type: Literal["meal", "break", "workout", "water"]
    detail: str = ""
    timestamp: Optional[datetime] = None


class LogEntry(LogRequest):
    id: int


class LogResponse(BaseModel):
    ok: bool = True
    entry: LogEntry
    total_logs: int


# ----- Weekly report ---------------------------------------------------------
class WeeklyReport(BaseModel):
    week_of: str
    summary: str
    stats: dict[str, str]
    insights: list[str]
    generated_by: str = "mock"
