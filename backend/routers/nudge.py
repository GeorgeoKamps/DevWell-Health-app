import asyncio
import json

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from agents import sitting_agent as agent
from chains.nudge_chain import generate_nudge
from data import store
from models.schemas import NudgeResponse, LogRequest

router = APIRouter(prefix="/nudge", tags=["nudge"])

CHECK_EVERY = 2     # seconds between SSE checks
IGNORE_GRACE = 90   # seconds before a pushed-but-unacknowledged nudge is logged as ignored


def _interval_sec(override: int | None) -> int:
    """Break interval in seconds: explicit override (for demos) or the user's
    persisted profile setting."""
    if override and override > 0:
        return override
    return max(1, store.get_profile().sitting_break_interval_min) * 60


@router.get("", response_model=NudgeResponse)
def get_nudge() -> NudgeResponse:
    return generate_nudge()


@router.get("/start", response_model=NudgeResponse)
def start_nudge_agent() -> NudgeResponse:
    return generate_nudge()


@router.post("/heartbeat")
def heartbeat(interval: int | None = Query(None)) -> dict:
    """Frontend pings this so the agent knows the user is active."""
    agent.heartbeat()
    return {"ok": True, **agent.snapshot(_interval_sec(interval))}


@router.post("/took-break")
def took_break() -> dict:
    """Reset the cycle when the user takes (or snoozes) a break, and persist it
    so it shows up in the Activity Log and Weekly Report."""
    store.add_log(LogRequest(type="break", detail="Took a break (agent nudge)"))
    agent.took_break()
    return {"ok": True}


async def nudge_events(interval: int | None):
    """SSE generator: emits a `nudge` event once a break is due. If a pushed
    nudge is ignored past the grace period, the agent re-arms (counting it)."""
    yield ": connected\n\n"
    while True:
        sec = _interval_sec(interval)
        if agent.break_due(sec) and not agent.already_nudged():
            agent.mark_nudged()
            n = await asyncio.to_thread(generate_nudge)
            payload = {
                "message": n.message,
                "micro_break": {"title": n.micro_break.title, "detail": n.micro_break.detail},
            }
            yield f"event: nudge\ndata: {json.dumps(payload)}\n\n"
        elif agent.ignored_due(IGNORE_GRACE):
            agent.rearm_after_ignore()
            yield ": nudge-ignored\n\n"
        else:
            yield ": keepalive\n\n"
        await asyncio.sleep(CHECK_EVERY)


@router.get("/stream")
async def stream(interval: int | None = Query(None)) -> StreamingResponse:
    """Server-Sent Events stream of break nudges from the autonomous agent."""
    return StreamingResponse(
        nudge_events(interval),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
