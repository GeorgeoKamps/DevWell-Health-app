# 🧑‍💻 DevWell

**Your AI-powered health companion — built for developers who forget they have a body.**

DevWell helps you eat better, move more, and breathe occasionally — without breaking your flow. Meal prep plans, smart workout sessions, real-time sitting alerts, and a health chat assistant that actually knows what it's talking about.

---

## ✨ Features

- 🥗 **Meal Prep Generator** — Weekly meal plans tailored to your diet and cooking time, with a ready-to-go shopping list
- 💪 **Workout Planner** — Short, targeted sessions designed around your actual schedule ("I have 20 mins")
- 🪑 **Sitting Alert Agent** — Gets notified when you've been glued to your chair too long and fires dev-themed nudges
- 🧘 **Mood & Stress Tips** — Tell it you're losing your mind over a bug, get an instant mental reset
- 📊 **Weekly Health Report** — Every Sunday, a personalized summary of your week with actionable suggestions
- 💬 **Health Chat** — Ask anything: nutrition, exercises, ergonomics — answered from a curated knowledge base

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | FastAPI |
| LLM | Claude API (`claude-sonnet-4-20250514`) |
| Vector DB | ChromaDB |
| Embeddings | sentence-transformers |
| Real-time | WebSockets / SSE |

---

## 📁 Project Structure

```
devwell/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── profile.py
│   │   ├── meal_plan.py
│   │   ├── workout.py
│   │   ├── nudge.py
│   │   ├── chat.py
│   │   └── log.py
│   ├── agents/
│   │   ├── sitting_alert_agent.py
│   │   └── weekly_report_agent.py
│   ├── chains/
│   │   ├── meal_chain.py
│   │   ├── workout_chain.py
│   │   └── mood_chain.py
│   ├── rag/
│   │   ├── ingest.py
│   │   └── retriever.py
│   ├── tools/
│   │   └── export_tool.py
│   └── knowledge_base/
│       ├── recipes/
│       ├── exercises/
│       ├── ergonomics/
│       └── mental_wellness/
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── ChatUI.jsx
        │   ├── MealPlanner.jsx
        │   ├── WorkoutCard.jsx
        │   ├── SittingTimer.jsx
        │   └── NudgeOverlay.jsx
        ├── hooks/
        │   ├── useHeartbeat.js
        │   └── useNudge.js
        └── App.jsx
```

---

## 🚀 Getting Started

### Run with Docker (recommended)

The whole stack — API + frontend — comes up with one command:

```bash
# from the repo root
docker compose up --build
```

- Frontend → http://localhost:8080
- API docs → http://localhost:8000/docs

Runs in **mock mode** out of the box (deterministic canned content, no API key needed). To enable real Claude responses, export a key before bringing it up:

```bash
export ANTHROPIC_API_KEY=  # Windows PowerShell: $env:ANTHROPIC_API_KEY=""
docker compose up --build
```

Your logs and profile persist in a named volume (`devwell-data`), so they survive restarts.

---

### Run locally (without Docker)

#### Prerequisites

- Python **3.11 or 3.12** (recommended). Avoid 3.13/3.14 — some dependencies (e.g. `pydantic-core`) don't yet ship prebuilt wheels for them, so `pip install` tries to compile from source and fails without a C/Rust toolchain. The Docker path uses 3.12 and sidesteps this entirely.
- Node.js 18+
- *(Optional)* An [Anthropic API key](https://console.anthropic.com/) — omit it to run in mock mode

#### 1. Clone the repo

```bash
git clone https://github.com/your-username/devwell.git
cd devwell
```

#### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

*(Optional)* Create a `.env` file in `/backend` to enable real Claude responses — skip it to run in mock mode:

```env
ANTHROPIC_API_KEY=your_api_key_here
CHROMA_DB_PATH=./chroma_db
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

#### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🧪 Testing

The backend ships with a pytest suite covering the persistence layer, the sitting-alert agent state machine, RAG retrieval, JSON extraction, and the HTTP routes (via FastAPI's `TestClient`). Tests run in isolated mock mode against a throwaway SQLite database — **no API key required**.

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

---

## 🛟 Troubleshooting

### "Failed to fetch" / signup or login hangs

This almost always means the **frontend can't reach the backend** — i.e. the API server isn't running. Check, in order:

1. **Is the backend up?** Look at the backend terminal — you should see `Uvicorn running on http://127.0.0.1:8000`. Open <http://localhost:8000/health>; it should return `{"status":"healthy", ...}`. If it doesn't load, the server is down.
2. **Missing dependencies.** If the terminal shows `ModuleNotFoundError` (e.g. `bcrypt` or `jwt`), your virtual environment is missing the auth packages. Reinstall:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   If `pip install` itself **fails building `pydantic-core`** with `error: linker 'link.exe' not found` (or a Rust/cargo error), your venv is on too-new a Python (3.13/3.14) that lacks prebuilt wheels. Recreate the venv on 3.12:
   ```bash
   py -3.12 -m venv venv         # Windows (install 3.12 first: winget install Python.Python.3.12)
   venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```
3. **Port mismatch.** The frontend talks to `http://localhost:8000` by default. If you started the backend on a different port, set `VITE_API_URL` in `frontend/.env` to match (see `frontend/.env.example`).

### Resetting the dev database (after a schema change)

The app uses SQLite and creates tables on startup, but it **does not auto-migrate** existing tables. After a change that alters the schema (for example, adding users/auth), an old `backend/devwell.db` will be missing new columns and requests will fail (e.g. a 500 on signup). Start fresh:

```bash
cd backend
# Windows
ren devwell.db devwell-old.bak    # or: del devwell.db
# macOS / Linux
mv devwell.db devwell-old.bak     # or: rm devwell.db
uvicorn main:app --reload
```

On the next start the schema is recreated cleanly. The database is gitignored and only holds local data, so removing it is safe in development.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create an account, returns a JWT |
| `POST` | `/auth/login` | Log in, returns a JWT |
| `GET` | `/auth/me` | Current user (requires token) |
| `POST` | `/profile` | Save user preferences |
| `GET` | `/profile` | Get user profile |
| `POST` | `/meal-plan` | Generate weekly meal plan |
| `POST` | `/meal-plan/export` | Export a plan + shopping list to PDF / Markdown |
| `POST` | `/workout` | Generate a workout session |
| `POST` | `/chat` | RAG-powered health chat |
| `POST` | `/mood` | Mood / stress reset suggestions |
| `POST` | `/log` | Log a meal, break, or workout |
| `DELETE` | `/log/{id}` | Remove a log entry |
| `GET` | `/report/weekly` | Get weekly health report |
| `GET` | `/stats` | Real streaks + this-week activity counts |
| `GET` | `/stats/report` | Doctor-friendly progress PDF/MD (`period=weekly\|monthly`) |
| `GET` | `/search` · `/knowledge` | Browse / search the knowledge base |
| `POST` | `/nudge/heartbeat` | Tell the agent the tab is active |
| `GET` | `/nudge/stream` | **SSE** stream of real-time break nudges |
| `POST` | `/nudge/took-break` | Acknowledge a break (logs it) |

---

## 🤖 How the AI Works

DevWell uses a combination of four GenAI patterns:

**RAG (Retrieval-Augmented Generation)**
Your questions are matched against a curated knowledge base of nutrition guides, exercise docs, and ergonomics tips — so answers are grounded in real content, not hallucinated.

**Prompt Chains**
Multi-step workflows like meal planning: retrieve recipes → build a balanced week → generate shopping list → format output. Each step feeds into the next.

**Agents**
The sitting alert agent runs autonomously in the background — it tracks your active time, decides when to nudge you, picks a relevant micro-break suggestion, and logs whether you took it.

**Tool Use**
The AI can call tools like exporting a shopping list to PDF, fetching your weekly log data, or formatting a workout plan for display.

---

## 🗓️ Roadmap

- [x] Project concept & architecture
- [x] FastAPI scaffolding
- [x] ChromaDB setup & knowledge base ingestion *(with a dependency-free TF-IDF fallback)*
- [x] Meal plan prompt chain
- [x] Workout generator with RAG
- [x] Sitting alert agent + real-time SSE nudges *(AI-generated)*
- [x] React dashboard with timer & streaks
- [x] Weekly health report from real activity logs
- [x] SQLite persistence (profile + activity log)
- [x] Health chat (RAG-grounded) + Mood/stress tips
- [x] Backend test suite + Docker / docker-compose
- [x] Shopping list PDF / Markdown export
- [x] Real streaks + activity stats (`/stats`)
- [x] Doctor-friendly weekly/monthly progress report (PDF / Markdown)
- [ ] Calendar integration for workout scheduling
- [ ] GitHub activity tracking (code-heavy day → more stretch reminders)

---

## 🤝 Contributing

This is a personal/experimental project but PRs and ideas are welcome. Open an issue to discuss what you'd like to add.

---

## 📄 License

MIT — do whatever you want with it, just go touch some grass occasionally. 🌿

---

*Built with ❤️ and too much coffee by a dev who also needed this.*
