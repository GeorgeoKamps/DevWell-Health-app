from fastapi import APIRouter
from data import store
from models.schemas import Profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=Profile)
def read_profile() -> Profile:
    return store.get_profile()


@router.post("", response_model=Profile)
def update_profile(profile: Profile) -> Profile:
    return store.save_profile(profile)
