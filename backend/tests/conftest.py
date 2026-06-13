"""Shared pytest fixtures.

Two things matter for isolation:
  1. Every test run gets its OWN throwaway SQLite file (set via DATABASE_URL
     *before* `db` is imported), so tests never touch the real devwell.db.
  2. ANTHROPIC_API_KEY is cleared so the app runs in deterministic mock mode.
     Tests that want to exercise the "AI is on" path monkeypatch it back.
"""
import os
import tempfile

import pytest

# --- isolate the database + force mock mode BEFORE backend modules import ---
_TMP_DB = os.path.join(tempfile.mkdtemp(prefix="devwell_test_"), "test.db")
os.environ["DATABASE_URL"] = "sqlite:///" + _TMP_DB
os.environ["ANTHROPIC_API_KEY"] = ""  # force deterministic mock mode

import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # backend/ on path

from db import init_db, engine, Base  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_db():
    """Recreate all tables before each test so state never leaks between tests."""
    Base.metadata.drop_all(bind=engine)
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """A FastAPI TestClient against the real app (mock AI mode)."""
    from fastapi.testclient import TestClient
    from main import app
    with TestClient(app) as c:
        yield c
