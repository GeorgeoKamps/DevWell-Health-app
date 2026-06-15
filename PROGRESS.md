# DevWell — Progress Notes

_Last updated: 2026-06-15_

## Current branch: `feat/auth-onboarding` (DONE in code, NOT merged to dev yet)

Multi-user authentication + onboarding. **Feature-complete and fully tested** (61 backend
tests pass, frontend builds clean). Held back from `dev` only because of a local
environment issue (see Blocker below) — the code itself is good.

### What was built
**Backend (multi-user + JWT)**
- `users` table; passwords hashed with **bcrypt**; **JWT** via PyJWT. `core_auth.py` =
  hashing + token create/decode + `get_current_user` dependency.
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`.
- Data is now **per-user**: `user_id` on profile + logs; store, stats, weekly report and
  progress report are all scoped to the signed-in user (verified isolation).
- `favorite_foods` added to the profile and fed into the meal-plan generator.
- Protected user-data routes; kept KB search + the agent SSE stream/heartbeat public
  (EventSource can't send auth headers); `took-break` is authed and logs to the user.
- `db.py`: `expire_on_commit=False` (fixes detached-instance errors after commit).

**Frontend**
- `AuthContext` + JWT in localStorage; `Authorization` header on every call; 401 auto-logout.
- **Login**, **Signup**, **Onboarding** (name, diet, favorite-foods chips) pages; route guard
  redirects to `/login`; **Log out** in the sidebar.

### Tests
- 61 backend tests pass (10 new auth: signup/login/validation/dup/token/hashing/isolation +
  protected-route 401s). Frontend `vite build` clean, no new lint errors.

## ⛔ Blocker (local run only — NOT a code bug)
The local backend wouldn't start → browser showed "failed to fetch" / `ERR_CONNECTION_REFUSED`.
Root cause chain (diagnosed via `python -c "import main"`):
1. venv had **no packages** (an earlier `pip install` went to the wrong interpreter), then
2. the venv was on **Python 3.14**, for which `pydantic-core` has no prebuilt wheel, so pip
   tried to compile it with Rust/MSVC and failed (`error: linker 'link.exe' not found`).

### Fix to resume (do this next time)
Recreate the venv on **Python 3.12** (now pinned via `backend/runtime.txt` + `.python-version`):
```
winget install Python.Python.3.12      # if 3.12 not installed (py -0p to check)
cd backend
rmdir /s /q venv
py -3.12 -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -c "import main; print('IMPORT OK')"
# delete the old pre-auth DB so the new schema is created fresh:
ren devwell.db devwell-preauth.bak
python -m uvicorn main:app --reload
```
Then http://localhost:8000/health should return JSON; sign up in the app at :5173.
(Or just use Docker — `docker compose up --build` — which already runs Python 3.12.)

## Earlier branches today/this week (already done)
- `chore/tests-and-docker` — pytest suite + Docker/compose.
- `feat/shopping-list-export` — meal plan → PDF/Markdown.
- `feat/streaks-and-stats` — real streaks, `/stats`, doctor weekly/monthly progress PDF.

## Next options
- Get auth running locally (Python 3.12), verify the flow end-to-end, then merge to dev.
- Feature 2: make Byte (the frog) answer real questions instead of canned lines.
- Calendar integration; GitHub-activity-aware nudges.

## Notes / gotchas
- **Use Python 3.11/3.12**, not 3.13/3.14 (wheel availability). Pinned in `backend/runtime.txt`.
- App runs in mock mode without `ANTHROPIC_API_KEY` (real key in `backend/.env`, gitignored).
- SQLite has no auto-migration: after a schema change, delete `backend/devwell.db` to recreate.
- Gitignored: `backend/.env`, `*.db`, `chroma_db/`, `.pytest_cache/`. `PROGRESS.md` is local notes.
