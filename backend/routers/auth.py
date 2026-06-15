from fastapi import APIRouter, HTTPException, Depends, status

from core_auth import hash_password, verify_password, create_access_token, get_current_user
from data import store
from data.orm import UserRow
from models.schemas import UserCreate, UserLogin, TokenResponse, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_response(user: UserRow) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserPublic(id=user.id, email=user.email),
    )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: UserCreate) -> TokenResponse:
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=422, detail="A valid email is required")
    if len(req.password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters")
    if store.get_user_by_email(email) is not None:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = store.create_user(email, hash_password(req.password), name=req.name.strip())
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin) -> TokenResponse:
    user = store.get_user_by_email(req.email.strip().lower())
    if user is None or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return _token_response(user)


@router.get("/me", response_model=UserPublic)
def me(user: UserRow = Depends(get_current_user)) -> UserPublic:
    return UserPublic(id=user.id, email=user.email)
