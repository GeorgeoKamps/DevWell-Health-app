# DevWell API — Backend

FastAPI backend for DevWell. **Scaffold phase:** every route returns placeholder
data. The AI layer (Claude prompt chains, RAG, the sitting-alert agent) gets
wired in on top of these stubs later — the response shapes won't change.

## Run locally

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- API root: http://localhost:8000/
- Interactive docs (Swagger): http://localhost:8000/docs

Copy `.env.example` to `.env` if you want to set CORS origins or (later) an API key.
The scaffold runs fine without any `.env`.

## Endpoints

| Method | Path             | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/`              | Meta / health ping                       |
| GET    | `/health`        | Status + whether an AI key is configured |
| GET    | `/profile`       | Get the user profile                     |
| POST   | `/profile`       | Save the user profile                    |
| POST   | `/meal-plan`     | Weekly meal plan + shopping list         |
| POST   | `/workout`       | A workout session                        |
| GET    | `/nudge`         | A single dev-themed nudge + micro-break  |
| GET    | `/nudge/start`   | (Stub) start the sitting-alert agent     |
| POST   | `/chat`          | Health chat reply                        |
| POST   | `/log`           | Log a meal / break / workout / water     |
| GET    | `/log`           | List logged entries                      |
| GET    | `/report/weekly` | Weekly health report                     |

## Structure

```
backend/
├── main.py            # app, CORS, router wiring, /health
├── requirements.txt
├── .env.example
├── models/
│   └── schemas.py     # Pydantic request/response models
├── data/
│   ├── mock.py        # placeholder data
│   └── store.py       # in-memory profile + logs (swap for a DB later)
└── routers/           # one module per feature
    ├── profile.py  meal_plan.py  workout.py
    ├── nudge.py    chat.py       log.py       report.py
```

## Notes

- State (profile, logs) is in-memory and resets on restart — fine for the scaffold.
- All responses include `generated_by: "mock"` where relevant, so the frontend
  (and you) can tell mock data from real AI output once that lands.
