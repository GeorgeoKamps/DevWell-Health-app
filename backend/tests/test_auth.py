"""Signup / login / token protection / per-user isolation."""


def test_signup_returns_token_and_user(client):
    r = client.post("/auth/signup", json={"email": "A@B.com", "password": "secret1", "name": "Al"})
    assert r.status_code == 201
    body = r.json()
    assert body["token_type"] == "bearer" and body["access_token"]
    assert body["user"]["email"] == "a@b.com"   # normalized lowercase


def test_signup_validates(client):
    assert client.post("/auth/signup", json={"email": "nope", "password": "secret1"}).status_code == 422
    assert client.post("/auth/signup", json={"email": "x@y.com", "password": "123"}).status_code == 422


def test_duplicate_email_conflicts(client):
    client.post("/auth/signup", json={"email": "dup@x.com", "password": "secret1"})
    assert client.post("/auth/signup", json={"email": "dup@x.com", "password": "secret1"}).status_code == 409


def test_login_good_and_bad(client):
    client.post("/auth/signup", json={"email": "u@x.com", "password": "rightpass"})
    assert client.post("/auth/login", json={"email": "u@x.com", "password": "rightpass"}).status_code == 200
    assert client.post("/auth/login", json={"email": "u@x.com", "password": "wrong"}).status_code == 401
    assert client.post("/auth/login", json={"email": "ghost@x.com", "password": "x"}).status_code == 401


def test_protected_routes_require_auth(client):
    for path in ("/profile", "/log", "/stats", "/report/weekly"):
        assert client.get(path).status_code == 401
    assert client.post("/meal-plan", json={}).status_code == 401
    assert client.post("/nudge/took-break").status_code == 401


def test_me_and_token_round_trip(client):
    tok = client.post("/auth/signup", json={"email": "me@x.com", "password": "secret1"}).json()["access_token"]
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200 and r.json()["email"] == "me@x.com"
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_password_is_hashed_not_stored_plain():
    from data import store
    from core_auth import hash_password, verify_password
    u = store.create_user("hash@x.com", hash_password("plaintext"), name="H")
    fetched = store.get_user_by_email("hash@x.com")
    assert fetched.password_hash != "plaintext"
    assert verify_password("plaintext", fetched.password_hash)


def test_users_are_isolated(client):
    t1 = client.post("/auth/signup", json={"email": "a1@x.com", "password": "secret1"}).json()["access_token"]
    t2 = client.post("/auth/signup", json={"email": "b2@x.com", "password": "secret1"}).json()["access_token"]
    H1 = {"Authorization": f"Bearer {t1}"}
    H2 = {"Authorization": f"Bearer {t2}"}
    client.post("/log", json={"type": "meal", "detail": "oats"}, headers=H1)
    assert len(client.get("/log", headers=H1).json()) == 1
    assert len(client.get("/log", headers=H2).json()) == 0   # user 2 sees nothing
