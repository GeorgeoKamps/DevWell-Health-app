"""The AI nudge chain must degrade gracefully to canned content with no key."""
from chains.nudge_chain import generate_nudge, _mock
from models.schemas import NudgeResponse


def test_generate_nudge_returns_valid_shape_in_mock_mode():
    # ANTHROPIC_API_KEY is unset by conftest -> mock path
    n = generate_nudge()
    assert isinstance(n, NudgeResponse)
    assert n.message
    assert n.micro_break.title and n.micro_break.detail


def test_mock_helper_directly():
    n = _mock()
    assert isinstance(n, NudgeResponse)
    assert n.message
