// Tiny fetch wrapper for the DevWell backend.
// Base URL is configurable via VITE_API_URL (see .env.example); defaults to local dev.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => request("/health"),
  getMealPlan: (opts) => request("/meal-plan", { method: "POST", body: opts || {} }),
  getWorkout: (opts) => request("/workout", { method: "POST", body: opts || {} }),
  getProfile: () => request("/profile"),
  saveProfile: (profile) => request("/profile", { method: "POST", body: profile }),
  getNudge: () => request("/nudge"),
  chat: (message, history = []) => request("/chat", { method: "POST", body: { message, history } }),
  log: (entry) => request("/log", { method: "POST", body: entry }),
  getLogs: () => request("/log"),
  weeklyReport: () => request("/report/weekly"),
};

export { API_URL };
