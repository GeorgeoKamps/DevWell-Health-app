"""End-to-end route tests via FastAPI TestClient (mock AI mode)."""


def test_health_and_root(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "healthy"
    assert body["ai_enabled"] is False        # no key in tests
    assert client.get("/").json()["status"] == "ok"


def test_profile_get_then_update(client):
    r = client.get("/profile")
    assert r.status_code == 200
    assert r.json()["sitting_break_interval_min"] == 45

    payload = r.json()
    payload["name"] = "Richardos"
    payload["sitting_break_interval_min"] = 25
    r2 = client.post("/profile", json=payload)
    assert r2.status_code == 200
    assert client.get("/profile").json()["name"] == "Richardos"


def test_log_lifecycle(client):
    assert client.get("/log").json() == []

    r = client.post("/log", json={"type": "water", "detail": "+250ml"})
    assert r.status_code == 200
    body = r.json()
    assert body["total_logs"] == 1
    log_id = body["entry"]["id"]

    assert len(client.get("/log").json()) == 1

    r_del = client.delete(f"/log/{log_id}")
    assert r_del.status_code == 200 and r_del.json()["ok"] is True
    assert client.get("/log").json() == []

    assert client.delete("/log/9999").status_code == 404


def test_log_rejects_invalid_type(client):
    assert client.post("/log", json={"type": "nonsense"}).status_code == 422


def test_nudge_endpoint_returns_message_and_break(client):
    r = client.get("/nudge")
    assert r.status_code == 200
    body = r.json()
    assert body["message"]
    assert body["micro_break"]["title"]


def test_nudge_heartbeat_snapshot(client):
    r = client.post("/nudge/heartbeat?interval=120")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["active"] is True
    assert "seconds_until_break" in body


def test_took_break_persists_a_log(client):
    before = len(client.get("/log").json())
    r = client.post("/nudge/took-break")
    assert r.status_code == 200 and r.json()["ok"] is True
    logs = client.get("/log").json()
    assert len(logs) == before + 1
    assert logs[-1]["type"] == "break"


def test_ai_features_return_mock_when_no_key(client):
    # meal plan
    mp = client.post("/meal-plan", json={"diet": "balanced", "days": 3})
    assert mp.status_code == 200
    assert mp.json()["generated_by"] == "mock"
    assert len(mp.json()["days"]) >= 1

    # chat
    ch = client.post("/chat", json={"message": "I feel tired", "history": []})
    assert ch.status_code == 200
    assert ch.json()["reply"]

    # workout
    wo = client.post("/workout", json={"available_minutes": 15, "focus": "back", "level": "easy"})
    assert wo.status_code == 200
    assert wo.json()["exercises"]


def test_search_and_knowledge(client):
    s = client.get("/search", params={"q": "hydration"})
    assert s.status_code == 200
    assert s.json()["results"]

    k = client.get("/knowledge")
    assert k.status_code == 200
    assert k.json()["categories"]
