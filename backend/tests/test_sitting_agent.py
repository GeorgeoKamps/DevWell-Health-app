"""Sitting-alert agent state machine. We drive `time.time()` via monkeypatch
so the tests are fast and deterministic (no real waiting)."""
import importlib

import agents.sitting_agent as agent


def _reset(monkeypatch, now):
    """Reload the module so its module-level _state starts clean, then pin time."""
    importlib.reload(agent)
    monkeypatch.setattr(agent.time, "time", lambda: now)


def test_active_only_within_window(monkeypatch):
    _reset(monkeypatch, 1000.0)
    agent.heartbeat()                 # last_active = 1000
    assert agent.is_active() is True
    monkeypatch.setattr(agent.time, "time", lambda: 1000 + agent.ACTIVE_WINDOW + 1)
    assert agent.is_active() is False


def test_break_due_after_interval_when_active(monkeypatch):
    _reset(monkeypatch, 1000.0)
    agent.took_break()                # last_break = 1000
    agent.heartbeat()
    assert agent.break_due(60) is False
    # jump 61s: interval passed AND still active (window 120)
    monkeypatch.setattr(agent.time, "time", lambda: 1061.0)
    agent.heartbeat()
    assert agent.break_due(60) is True


def test_nudge_marking_is_one_shot(monkeypatch):
    _reset(monkeypatch, 0.0)
    assert agent.already_nudged() is False
    agent.mark_nudged()
    assert agent.already_nudged() is True
    agent.took_break()                # taking a break clears the nudge flag
    assert agent.already_nudged() is False


def test_ignored_due_then_rearm(monkeypatch):
    _reset(monkeypatch, 0.0)
    agent.heartbeat()
    agent.mark_nudged()               # nudged_at = 0
    assert agent.ignored_due(90) is False
    # 91s later, still active, never acknowledged -> ignored
    monkeypatch.setattr(agent.time, "time", lambda: 91.0)
    agent.heartbeat()
    assert agent.ignored_due(90) is True
    agent.rearm_after_ignore()
    assert agent._state["ignored"] == 1
    assert agent.already_nudged() is False


def test_snapshot_shape(monkeypatch):
    _reset(monkeypatch, 500.0)
    agent.took_break()
    agent.heartbeat()
    snap = agent.snapshot(120)
    assert set(snap) >= {"active", "seconds_until_break"}
    assert snap["active"] is True
    assert 0 <= snap["seconds_until_break"] <= 120
