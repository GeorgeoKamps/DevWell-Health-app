import random
from fastapi import APIRouter
from data import mock
from models.schemas import NudgeResponse, MicroBreak

router = APIRouter(prefix="/nudge", tags=["nudge"])


def _build_nudge() -> NudgeResponse:
    return NudgeResponse(
        message=random.choice(mock.NUDGES),
        micro_break=MicroBreak(**random.choice(mock.MICRO_BREAKS)),
    )


@router.get("", response_model=NudgeResponse)
def get_nudge() -> NudgeResponse:
    return _build_nudge()


@router.get("/start", response_model=NudgeResponse)
def start_nudge_agent() -> NudgeResponse:
    """Placeholder for the autonomous sitting-alert agent. For now it just
    returns one nudge; later this kicks off the scheduled agent loop."""
    return _build_nudge()
