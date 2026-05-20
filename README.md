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

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/devwell.git
cd devwell
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```env
ANTHROPIC_API_KEY=your_api_key_here
CHROMA_DB_PATH=./chroma_db
```

Ingest the knowledge base:

```bash
python rag/ingest.py
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/profile` | Save user preferences |
| `GET` | `/profile` | Get user profile |
| `POST` | `/meal-plan` | Generate weekly meal plan |
| `POST` | `/workout` | Generate a workout session |
| `GET` | `/nudge/start` | Start sitting alert agent |
| `POST` | `/chat` | RAG-powered health chat |
| `POST` | `/log` | Log a meal, break, or workout |
| `GET` | `/report/weekly` | Get weekly health report |
| `WS` | `/ws/nudge` | WebSocket channel for real-time nudges |

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
- [ ] FastAPI scaffolding
- [ ] ChromaDB setup & knowledge base ingestion
- [ ] Meal plan prompt chain
- [ ] Workout generator with RAG
- [ ] Sitting alert agent + WebSocket nudges
- [ ] React dashboard with timer & streaks
- [ ] Weekly health report agent
- [ ] Shopping list PDF export
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
