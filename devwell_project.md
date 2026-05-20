# 🧑‍💻 DevWell — The Health Companion for Developers

> An AI-powered wellness sidekick built for developers who sit many hours a day.
> Fights back with smart nudges, personalized meal prep, and workout plans that fit a dev's chaotic schedule.

---

## 🎯 Project Goal

Build a **GenAI-powered wellness app** that combines agents, RAG, tool use, and multi-step prompt chains into a single, genuinely useful product — targeting developers who struggle to maintain healthy habits while working long hours at a screen.

---

## 🧩 Core Features

| Feature | Description | GenAI Capability |
|---|---|---|
| 🥗 Meal Prep Generator | Weekly meal plan based on diet preferences & time budget, with auto-generated shopping list | Prompt chains |
| 💪 Workout Planner | Tailored workout sessions based on available time ("I have 20 mins between standups") | RAG over exercise knowledge base |
| 🪑 Sitting Alert Agent | Monitors screen time, fires dev-themed nudges, suggests micro-breaks | Autonomous agent |
| 🧘 Stress & Mood Tips | Detects user mood from input and suggests a coping activity or quick exercise | Prompt chain |
| 📊 Weekly Health Report | Aggregates daily logs and generates a personalized weekly insight summary | Agent + prompt chain |
| 🔍 Health Chat | Ask anything — "high-protein meal in 15 mins?" — answered from a curated knowledge base | RAG-powered chat |

---

## 🏗️ Tech Stack

### Backend — FastAPI
```
FastAPI
├── /profile        → Store & manage user preferences (diet, fitness level, work schedule)
├── /meal-plan      → Generate weekly meals + shopping list via prompt chains
├── /workout        → Generate workout session based on available time
├── /nudge          → Sitting alert agent — fires reminders on a schedule
├── /chat           → RAG-powered health Q&A
└── /log            → Track meals eaten, breaks taken, workouts done
```

### Frontend — React
```
React App
├── Dashboard       → Streaks, today's plan, next nudge countdown
├── Chat UI         → Conversational health assistant
├── Meal Planner    → Weekly view + shopping list export
└── Activity Timer  → Visible sitting countdown + break overlay popup
```

### AI & Data Layer
```
LLM:          Claude API — claude-sonnet-4-20250514
Embeddings:   sentence-transformers (local) or OpenAI ada
Vector DB:    ChromaDB (local, zero setup) or Qdrant
Knowledge Base:
  - Nutrition & recipe documents
  - Exercise & stretching guides
  - Ergonomics & eye care tips
  - Mental wellness for developers
```

### Communication
```
WebSockets / SSE  → Real-time nudge delivery from backend agent to React UI
```

---

## 🤖 Agent & Chain Flows

### 1. Sitting Alert Agent
```
Every 45 minutes:
  1. Check if user is active (frontend sends heartbeat to backend)
  2. [Prompt] Generate a fun, dev-themed nudge
       e.g. "You've been git blame-ing for 47 mins. Stand up."
  3. Push notification / overlay in React UI
  4. Suggest a 5-min micro-workout (stretches, eye exercises)
  5. Log the break — or log that it was ignored 😅
```

### 2. Meal Prep Prompt Chain
```
User: "Plan my meals for the week, I'm vegetarian, max 30 min cook time"
  1. [RAG]   Retrieve matching recipes from knowledge base
  2. [Chain] Build a balanced 7-day plan (macros, variety)
  3. [Chain] Consolidate ingredients into a shopping list
  4. [Tool]  Format & export as markdown / PDF
```

### 3. Workout Generator Chain
```
User: "I have 20 mins and my back hurts from sitting"
  1. [RAG]   Retrieve exercises for back pain + short duration
  2. [Chain] Build a safe, targeted mini-session
  3. [Chain] Add warm-up and cool-down steps
  4. Return structured plan with reps, sets, durations
```

### 4. Stress / Mood Chain
```
User: "I've been debugging for 4 hours and I'm losing my mind"
  1. [Prompt] Detect frustration/stress from message
  2. [RAG]    Retrieve mental reset techniques
  3. [Chain]  Pick 1 breathing exercise + 1 physical break
  4. Deliver empathetic, actionable response
```

### 5. Weekly Health Report Agent
```
Triggered every Sunday evening:
  1. [Tool]  Fetch all logs for the week (meals, breaks, workouts)
  2. [Chain] Analyze patterns — skipped meals, missed breaks, workout consistency
  3. [Chain] Generate personalized insights & suggestions for next week
  4. Deliver summary in dashboard + optional email export
```

---

## 📁 Suggested Project Structure

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
│   ├── knowledge_base/
│   │   ├── recipes/
│   │   ├── exercises/
│   │   ├── ergonomics/
│   │   └── mental_wellness/
│   └── models/
│       ├── user.py
│       └── log.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── ChatUI.jsx
    │   │   ├── MealPlanner.jsx
    │   │   ├── WorkoutCard.jsx
    │   │   ├── SittingTimer.jsx
    │   │   └── NudgeOverlay.jsx
    │   ├── hooks/
    │   │   ├── useHeartbeat.js
    │   │   └── useNudge.js
    │   └── App.jsx
    └── package.json
```

---

## 🗓️ Build Milestones

### Week 1 — Foundation
- [ ] FastAPI project scaffolding with all routes stubbed
- [ ] User profile setup (diet prefs, fitness level, schedule)
- [ ] Meal plan generator — basic prompt chain working
- [ ] React app bootstrapped with routing and layout

### Week 2 — RAG + Chat
- [ ] Ingest nutrition, recipe & exercise docs into ChromaDB
- [ ] RAG-powered `/chat` endpoint
- [ ] Chat UI in React connected to backend
- [ ] Workout generator pulling from knowledge base

### Week 3 — The Agent Layer
- [ ] Sitting alert agent with 45-min timer logic
- [ ] Frontend heartbeat hook + NudgeOverlay component
- [ ] WebSocket / SSE channel for real-time nudges
- [ ] Stress/mood detection chain

### Week 4 — Polish & Reports
- [ ] Logging system (meals, workouts, breaks)
- [ ] Weekly health report agent
- [ ] Dashboard with streaks, charts, and weekly summary
- [ ] Shopping list export (PDF/markdown)

---

## 🔥 Why This Is a Great Project

- Every feature exercises a **different GenAI muscle** — RAG, agents, tool use, chains
- Real-time agent → UI communication via **WebSockets/SSE** is a great backend skill
- The knowledge base is **self-contained and easy to expand** (just add more docs)
- You'll actually **use it daily** while building it
- Highly **demo-friendly** — timer, overlays, streaks, chat all look great visually
- Endlessly extensible: add GitHub activity tracking, calendar integration, Spotify focus playlists...

---

## 🚀 Next Steps

1. Scaffold the FastAPI backend with all routes
2. Set up ChromaDB and ingest the first batch of knowledge base docs
3. Bootstrap the React frontend with the dashboard layout
4. Build the first working chain: **meal plan generator**

---

*Built with FastAPI · React · Claude API · ChromaDB*
