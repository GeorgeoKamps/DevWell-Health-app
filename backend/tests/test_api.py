"""End-to-end route tests via TestClient (mock AI mode). Protected routes use
the `auth_client` fixture (a signed-up user with a bearer token)."""


def test_health_and_root(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy" and r.json()["ai_enabled"] is False
    assert client.get("/").json()["status"] == "ok"


def test_profile_get_then_update(auth_client):
    r = auth_client.get("/profile")
    assert r.status_code == 200 and r.json()["sitting_break_interval_min"] == 45
    payload = r.json()
    payload["name"] = "Richardos"
    payload["sitting_break_interval_min"] = 25
    assert auth_client.post("/profile", json=payload).status_code == 200
    assert auth_client.get("/profile").json()["name"] == "Richardos"


def test_log_lifecycle(auth_client):
    assert auth_client.get("/log").json() == []
    r = auth_client.post("/log", json={"type": "water", "detail": "+250ml"})
    assert r.status_code == 200 and r.json()["total_logs"] == 1
    log_id = r.json()["entry"]["id"]
    assert len(auth_client.get("/log").json()) == 1
    assert auth_client.delete(f"/log/{log_id}").json()["ok"] is True
    assert auth_client.get("/log").json() == []
    assert auth_client.delete("/log/9999").status_code == 404


def test_log_rejects_invalid_type(auth_client):
    assert auth_client.post("/log", json={"type": "nonsense"}).status_code == 422


def test_nudge_endpoint_is_public(client):
    body = client.get("/nudge").json()
    assert body["message"] and body["micro_break"]["title"]


def test_nudge_heartbeat_public_snapshot(client):
    body = client.post("/nudge/heartbeat?interval=120").json()
    assert body["ok"] is True and body["active"] is True and "seconds_until_break" in body


def test_took_break_logs_for_user(auth_client):
    before = len(auth_client.get("/log").json())
    assert auth_client.post("/nudge/took-break").json()["ok"] is True
    logs = auth_client.get("/log").json()
    assert len(logs) == before + 1 and logs[-1]["type"] == "break"


def test_ai_features_return_mock_when_no_key(auth_client):
    mp = auth_client.post("/meal-plan", json={"diet": "balanced", "days": 3})
    assert mp.status_code == 200 and mp.json()["generated_by"] == "mock" and len(mp.json()["days"]) >= 1
    ch = auth_client.post("/chat", json={"message": "I feel tired", "history": []})
    assert ch.status_code == 200 and ch.json()["reply"]
    wo = auth_client.post("/workout", json={"available_minutes": 15, "focus": "back", "level": "easy"})
    assert wo.status_code == 200 and wo.json()["exercises"]


def test_search_and_knowledge_public(client):
    assert client.get("/search", params={"q": "hydration"}).json()["results"]
    assert client.get("/knowledge").json()["categories"]
