"""Persistence layer: per-user profile (single upsert-able row) + logs."""
from data import store
from models.schemas import Profile, LogRequest


def test_default_profile_is_created_on_first_read(user_id):
    p = store.get_profile(user_id)
    assert isinstance(p, Profile)
    assert p.sitting_break_interval_min == 45


def test_save_profile_upserts_for_user(user_id):
    p = store.get_profile(user_id)
    p.name = "Richardos"
    p.sitting_break_interval_min = 30
    store.save_profile(user_id, p)
    again = store.get_profile(user_id)
    assert again.name == "Richardos"
    assert again.sitting_break_interval_min == 30


def test_favorite_foods_roundtrip(user_id):
    p = store.get_profile(user_id)
    p.favorite_foods = ["sushi", "oats"]
    store.save_profile(user_id, p)
    assert store.get_profile(user_id).favorite_foods == ["sushi", "oats"]


def test_allergies_roundtrip_as_list(user_id):
    p = store.get_profile(user_id)
    p.allergies = ["peanuts", "shellfish"]
    store.save_profile(user_id, p)
    assert store.get_profile(user_id).allergies == ["peanuts", "shellfish"]


def test_add_and_list_logs(user_id):
    assert store.list_logs(user_id) == []
    store.add_log(user_id, LogRequest(type="water", detail="+250ml"))
    store.add_log(user_id, LogRequest(type="break", detail="Stretch"))
    logs = store.list_logs(user_id)
    assert [l.type for l in logs] == ["water", "break"]


def test_delete_log_scoped_to_user(user_id):
    e = store.add_log(user_id, LogRequest(type="meal", detail="Oats"))
    assert store.delete_log(user_id, e.id) is True
    assert store.list_logs(user_id) == []
    assert store.delete_log(user_id, 9999) is False


def test_delete_log_rejects_other_users_row(user_id):
    from core_auth import hash_password
    other = store.create_user("other@x.com", hash_password("pw")).id
    e = store.add_log(user_id, LogRequest(type="meal", detail="mine"))
    # the other user must not be able to delete my log
    assert store.delete_log(other, e.id) is False
    assert len(store.list_logs(user_id)) == 1
