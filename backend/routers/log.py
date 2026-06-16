from fastapi import APIRouter, HTTPException, Query
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


@router.delete("")
def clear_logs(type: str | None = Query(None)) -> dict:
    """Wipe activity — everything, or just one category via ?type=water|meal|workout|break."""
    removed = store.clear_logs(type)
    return {"ok": True, "removed": removed, "total_logs": len(store.list_logs())}


@router.delete("/{log_id}")
def delete_log(log_id: int) -> dict:
    if not store.delete_log(log_id):
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"ok": True, "total_logs": len(store.list_logs())}
