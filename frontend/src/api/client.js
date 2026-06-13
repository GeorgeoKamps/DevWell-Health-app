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
  heartbeat: (interval) => request(`/nudge/heartbeat${interval ? `?interval=${interval}` : ""}`, { method: "POST" }),
  tookBreak: () => request("/nudge/took-break", { method: "POST" }),
  chat: (message, history = []) => request("/chat", { method: "POST", body: { message, history } }),
  log: (entry) => request("/log", { method: "POST", body: entry }),
  getLogs: () => request("/log"),
  deleteLog: (id) => request(`/log/${id}`, { method: "DELETE" }),
  weeklyReport: () => request("/report/weekly"),
  stats: () => request("/stats"),
  mood: (message) => request("/mood", { method: "POST", body: { message } }),
  search: (q, k = 5) => request(`/search?q=${encodeURIComponent(q)}&k=${k}`),
  knowledge: () => request("/knowledge"),
  knowledgeDoc: (source) => request(`/knowledge/doc?source=${encodeURIComponent(source)}`),

  // Posts the current plan back and triggers a file download (PDF or Markdown).
  exportMealPlan: async (plan, format = "pdf") => {
    const res = await fetch(`${API_URL}/meal-plan/export?format=${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    const name = match ? decodeURIComponent(match[1]) : `devwell-meal-plan.${format === "pdf" ? "pdf" : "md"}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export { API_URL };
