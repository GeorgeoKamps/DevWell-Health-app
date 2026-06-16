# 🧑‍💻 DevWell

**Your AI-powered health companion — built for developers who forget they have a body.**

DevWell helps you eat better, move more, and breathe occasionally — without breaking your flow. Meal prep plans, smart workout sessions, real-time sitting alerts, and a health chat assistant that actually knows what it's talking about.

---

## ✨ Features

- 🥗 **Meal Prep Generator** — Weekly meal plans tailored to your **diet, favourite foods, allergies, and dislikes**, with a ready-to-go shopping list. Export any plan to **PDF or Markdown**.
- 💪 **Workout Planner** — Short, targeted sessions designed around your actual schedule ("I have 20 mins").
- 🪑 **Sitting Alert Agent** — An autonomous agent watches your active time and pushes **real-time, dev-themed break nudges** over SSE when you've been sitting too long.
- 🧘 **Mood & Stress Check** — Tell it you're losing your mind over a bug; it detects your mood and gives an empathetic reply plus a breathing exercise and a desk reset (with a safety path for distress).
- 💬 **Health Chat** — Ask anything about nutrition, workouts, ergonomics, sleep, or focus — answers are grounded in a curated knowledge base with source citations.
- 📊 **Weekly Report + Doctor Report** — A weekly summary of your activity, plus a **doctor-friendly progress report** (last 7 or 30 days) you can download as PDF.
- 🔥 **Streaks & Activity Log** — Real streaks and per-category stats derived from what you actually log, with **fresh-start resets** (per category or all at once).
- 🧠 **Works with or without an API key** — every AI feature has a knowledge-base-grounded fallback, so the app is fully functional offline (in "mock mode").

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (`react-router`, inline styles, lucide icons) |
| Backend | FastAPI + Pydantic v2 |
| LLM | Claude API (model configurable via `CLAUDE_MODEL`) |
| Retrieval (RAG) | ChromaDB, with a dependency-free TF-IDF fallback |
| Persistence | SQLite (via SQLAlchemy) |
| Real-time | Server-Sent Events (SSE) for the sitting-alert agent |
| Tests / deploy | pytest · Docker + docker-compose |

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
export ANTHROPIC_API_KEY=sk-ant-...   # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
docker compose up --build
```

Your logs and profile persist in a named volume (`devwell-data`), so they survive restarts.

---

### Run locally (without Docker)

#### Prerequisites

- Python **3.11 or 3.12** (avoid 3.13/3.14 — some deps lack prebuilt wheels and would try to compile from source). The Docker path uses 3.12 and avoids this entirely.
- Node.js 18+
- *(Optional)* An [Anthropic API key](https://console.anthropic.com/) — omit it to run in **mock mode** (fully functional, with knowledge-base-grounded fallback answers)

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

> **Heads-up:** start the **backend first**, then the frontend. Keep both terminals open — closing the backend shows "failed to fetch" in the UI. If you change the Python deps or hit a schema error, see **Troubleshooting** below.

---

## 🧭 Using the app

Open `http://localhost:5173` and you land on the **Dashboard**. The app opens with a clean slate; everything you do is logged and reflected in your stats. Things to try:

- **Dashboard** — log water/meals/workouts; watch the streak and tiles update. Each tile (and a master button) has a **Reset** to start fresh.
- **Meal Planner** — fill in your **diet, liked foods, allergies, and disliked foods**, then **Generate my meal plan** — the week (and shopping list) adapt to your taste. Export it to **PDF/Markdown**.
- **Health Chat** — ask anything ("best upper-body exercises", "how much water should I drink") and get a knowledge-base-grounded answer with sources.
- **Mood Check** — type how you feel; it detects your mood and gives an empathetic reply + breathing/desk reset.
- **Activity Timer / Byte the frog** — the sitting-alert agent nudges you to take breaks.
- **Weekly Report** — see your week and download a **doctor-friendly progress report** (last 7 or 30 days).

**AI mode vs mock mode:** with a valid `ANTHROPIC_API_KEY` (and internet access to Anthropic) the answers are generated live by Claude. Without a key — or if the network can't reach Anthropic — the app runs in **mock mode**: still fully clickable, with relevant, knowledge-base-grounded answers. Check which mode you're in at `http://localhost:8000/health` (`ai_enabled: true/false`).

---

## 🧪 Testing

The backend ships with a pytest suite covering the persistence layer, the sitting-alert agent state machine, RAG retrieval, JSON extraction, and the HTTP routes (via FastAPI's `TestClient`). Tests run in isolated mock mode against a throwaway SQLite database — **no API key required**.

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/profile` | Save user preferences |
| `GET` | `/profile` | Get user profile |
| `POST` | `/meal-plan` | Generate weekly meal plan |
| `POST` | `/meal-plan/export` | Export a plan + shopping list to PDF / Markdown |
| `POST` | `/workout` | Generate a workout session |
| `POST` | `/chat` | RAG-powered health chat |
| `POST` | `/mood` | Mood / stress reset suggestions |
| `POST` | `/log` | Log a meal, break, or workout |
| `DELETE` | `/log/{id}` | Remove a single log entry |
| `DELETE` | `/log` | Clear all activity, or one category via `?type=water\|meal\|workout\|break` |
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
Multi-step workflows like meal planning: take your preferences (diet, **favourite foods, allergies, dislikes**) → retrieve relevant recipes → build a balanced week (strictly avoiding allergens) → consolidate the ingredients into a shopping list. Each step feeds into the next.

**Agents**
The sitting alert agent runs autonomously in the background — it tracks your active time, decides when to nudge you, picks a relevant micro-break suggestion, and logs whether you took it.

**Tool Use**
The AI can call tools like exporting a shopping list / meal plan to PDF or Markdown, building a doctor-friendly progress report, or formatting a workout plan for display.

**Graceful fallback (mock mode)**
Retrieval runs locally, so even with **no API key** every feature still works: Health Chat and Mood answer from the knowledge base (keyword intent-routing picks the right doc), and the Meal Planner still respects your allergies, dislikes, and favourites. The API timeouts are capped, so a slow/unreachable Claude never hangs a request — it falls back instead.

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
