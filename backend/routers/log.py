from fastapi import APIRouter, HTTPException, Depends
from core_auth import get_current_user
from data import store
from data.orm import UserRow
from models.schemas import LogRequest, LogResponse, LogEntry

router = APIRouter(prefix="/log", tags=["log"])


@router.post("", response_model=LogResponse)
def add_log(req: LogRequest, user: UserRow = Depends(get_current_user)) -> LogResponse:
    entry = store.add_log(user.id, req)
    return LogResponse(entry=entry, total_logs=len(store.list_logs(user.id)))


@router.get("", response_model=list[LogEntry])
def get_logs(user: UserRow = Depends(get_current_user)) -> list[LogEntry]:
    return store.list_logs(user.id)


@router.delete("/{log_id}")
def delete_log(log_id: int, user: UserRow = Depends(get_current_user)) -> dict:
    if not store.delete_log(user.id, log_id):
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"ok": True, "total_logs": len(store.list_logs(user.id))}
