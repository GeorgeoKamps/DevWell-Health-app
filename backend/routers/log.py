from fastapi import APIRouter
from data import store
from models.schemas import LogRequest, LogResponse, LogEntry

router = APIRouter(prefix="/log", tags=["log"])


@router.post("", response_model=LogResponse)
def add_log(req: LogRequest) -> LogResponse:
    entry = store.add_log(req)
    return LogResponse(entry=entry, total_logs=len(store.list_logs()))


@router.get("", response_model=list[LogEntry])
def get_logs() -> list[LogEntry]:
    return store.list_logs()
