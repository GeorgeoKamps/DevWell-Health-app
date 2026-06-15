"""Authentication core: password hashing (bcrypt) + JWT tokens + the
`get_current_user` FastAPI dependency that protects routes."""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from db import SessionLocal
from data.orm import UserRow

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
TOKEN_TTL_HOURS = int(os.getenv("JWT_TTL_HOURS", "168"))  # 7 days

_bearer = HTTPBearer(auto_error=False)


# ---- passwords ----
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ---- tokens ----
def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + timedelta(hours=TOKEN_TTL_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def _decode(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---- dependency ----
def get_current_user(creds: HTTPAuthorizationCredentials = Depends(_bearer)) -> UserRow:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = _decode(creds.credentials)
    with SessionLocal() as db:
        user = db.get(UserRow, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        db.expunge(user)
        return user
