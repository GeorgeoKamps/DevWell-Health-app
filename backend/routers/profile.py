from fastapi import APIRouter, Depends
from core_auth import get_current_user
from data import store
from data.orm import UserRow
from models.schemas import Profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=Profile)
def get_profile(user: UserRow = Depends(get_current_user)) -> Profile:
    return store.get_profile(user.id)


@router.post("", response_model=Profile)
def save_profile(profile: Profile, user: UserRow = Depends(get_current_user)) -> Profile:
    return store.save_profile(user.id, profile)
