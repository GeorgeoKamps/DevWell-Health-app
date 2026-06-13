"""Persistence layer: profile is a single upsert-able row; logs accumulate."""
from data import store
from models.schemas import Profile, LogRequest


def test_default_profile_is_created_on_first_read():
    p = store.get_profile()
    assert isinstance(p, Profile)
    assert p.sitting_break_interval_min == 45


def test_save_profile_upserts_single_row():
    p = store.get_profile()
    p.name = "Richardos"
    p.sitting_break_interval_min = 30
    store.save_profile(p)

    again = store.get_profile()
    assert again.name == "Richardos"
    assert again.sitting_break_interval_min == 30


def test_allergies_roundtrip_as_list():
    p = store.get_profile()
    p.allergies = ["peanuts", "shellfish"]
    store.save_profile(p)
    assert store.get_profile().allergies == ["peanuts", "shellfish"]


def test_add_and_list_logs():
    assert store.list_logs() == []
    store.add_log(LogRequest(type="water", detail="+250ml"))
    store.add_log(LogRequest(type="break", detail="Stretch"))
    logs = store.list_logs()
    assert [l.type for l in logs] == ["water", "break"]
    assert all(l.id is not None for l in logs)


def test_delete_log():
    e = store.add_log(LogRequest(type="meal", detail="Oats"))
    assert store.delete_log(e.id) is True
    assert store.list_logs() == []
    # deleting a missing id is a no-op, returns False
    assert store.delete_log(9999) is False
