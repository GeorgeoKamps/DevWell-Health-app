// Tiny fetch wrapper for the DevWell backend, with JWT auth.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "devwell_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function authHeaders(extra = {}) {
  const t = getToken();
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(body ? { "Content-Type": "application/json" } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("401 Unauthorized");
  }
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); if (j.detail) detail = j.detail; } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json();
}

// Trigger a file download from an authenticated endpoint.
async function download(path, { method = "GET", body } = {}, fallbackName = "download") {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(body ? { "Content-Type": "application/json" } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
  const name = match ? decodeURIComponent(match[1]) : fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  // auth
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),

  // app
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
  search: (q, k = 5) => request(`/search?q=${encodeURIComponent(q)}&k=${k}`),
  knowledge: () => request("/knowledge"),
  knowledgeDoc: (source) => request(`/knowledge/doc?source=${encodeURIComponent(source)}`),

  exportMealPlan: (plan, format = "pdf") =>
    download(`/meal-plan/export?format=${format}`, { method: "POST", body: plan }, `devwell-meal-plan.${format === "pdf" ? "pdf" : "md"}`),
  exportProgress: (period = "weekly", format = "pdf") =>
    download(`/stats/report?period=${period}&format=${format}`, {}, `devwell-progress-${period}.${format === "pdf" ? "pdf" : "md"}`),
};

export { API_URL };
