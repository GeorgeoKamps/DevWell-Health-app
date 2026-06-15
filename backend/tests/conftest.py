"""Shared pytest fixtures.

Isolation: each run gets its own throwaway SQLite file (DATABASE_URL set before
`db` imports) and mock AI mode (empty ANTHROPIC_API_KEY). Tables are recreated
before every test so state never leaks.
"""
import os
import tempfile
import sys

import pytest

_TMP_DB = os.path.join(tempfile.mkdtemp(prefix="devwell_test_"), "test.db")
os.environ["DATABASE_URL"] = "sqlite:///" + _TMP_DB
os.environ["ANTHROPIC_API_KEY"] = ""  # force deterministic mock mode

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db import init_db, engine, Base  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Unauthenticated TestClient (for auth tests + public routes)."""
    from fastapi.testclient import TestClient
    from main import app
    with TestClient(app) as c:
        yield c


@pytest.fixture
def user_id():
    """Create a user directly and return its id (for unit tests of store/stats)."""
    from core_auth import hash_password
    from data import store
    return store.create_user("unit@test.dev", hash_password("password"), name="Unit").id


@pytest.fixture
def auth_client(client):
    """TestClient with a freshly signed-up user's bearer token attached."""
    r = client.post("/auth/signup", json={"email": "tester@dev.local", "password": "secret123", "name": "Tester"})
    token = r.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
