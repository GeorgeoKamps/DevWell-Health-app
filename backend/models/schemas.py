"""Pydantic request/response models for the DevWell API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ----- Profile ---------------------------------------------------------------
class Profile(BaseModel):
    name: str = "George"
    age: Optional[int] = 27
    weight_kg: Optional[float] = 78
    height_cm: Optional[float] = 180
    diet: str = "No restrictions"
    fitness_level: str = "Intermediate"
    goal: str = "Stay healthy"
    screen_hours: str = "8-10"
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
    sources: list[str] = []
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
    sources: list[str] = []
    generated_by: str = "mock"


# ----- Chat ------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


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
class ReportCard(BaseModel):
    label: str
    value: str
    tone: Literal["accent", "amber", "blue"] = "accent"


class ReportInsight(BaseModel):
    label: str
    value: str
    note: str
    good: bool = False


class WeeklyReport(BaseModel):
    week_of: str
    score: int
    cards: list[ReportCard]
    days: list[str]
    workouts: list[int]
    water: list[float]
    sitting: list[float]
    insights: list[ReportInsight]
    tip: str
    generated_by: str = "mock"


# ----- Mood / stress ---------------------------------------------------------
class MoodSuggestion(BaseModel):
    title: str
    detail: str


class MoodRequest(BaseModel):
    message: str


class MoodResponse(BaseModel):
    mood: str
    reply: str
    breathing: MoodSuggestion
    physical: MoodSuggestion
    sources: list[str] = []
    generated_by: str = "mock"


# ----- Knowledge base / search ----------------------------------------------
class SearchResult(BaseModel):
    text: str
    source: str
    category: str
    score: Optional[float] = None


class SearchResponse(BaseModel):
    query: str
    backend: str
    results: list[SearchResult]


class KnowledgeResponse(BaseModel):
    backend: str
    categories: dict[str, list[str]]


class KnowledgeDoc(BaseModel):
    source: str
    category: str
    text: str


# ---- Stats / streaks --------------------------------------------------------
class WeekCounts(BaseModel):
    meals: int = 0
    workouts: int = 0
    water: int = 0
    breaks: int = 0


class StatsResponse(BaseModel):
    current_streak: int = 0
    longest_streak: int = 0
    active_days_this_week: int = 0
    total_logs: int = 0
    logged_today: bool = False
    this_week: WeekCounts = WeekCounts()


# ---- Progress report (doctor-friendly export) -------------------------------
class DayActivity(BaseModel):
    date: str
    meals: int = 0
    workouts: int = 0
    water: int = 0
    breaks: int = 0
    total: int = 0


class ProgressReport(BaseModel):
    patient_name: str = "DevWell user"
    period_label: str = "Weekly"
    start_date: str = ""
    end_date: str = ""
    days: int = 7
    current_streak: int = 0
    longest_streak: int = 0
    active_days: int = 0
    totals: WeekCounts = WeekCounts()
    daily: list[DayActivity] = []
