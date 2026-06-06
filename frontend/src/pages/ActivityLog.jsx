import { useState, useEffect, useCallback } from "react";
import { Salad, Dumbbell, Droplets, Clock, Plus, X, RefreshCw } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };
const inputStyle = { padding: "8px 11px", borderRadius: "8px", border: "0.5px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", outline: "none" };

const seedLogs = [
  { id: "s1", type: "meal",    label: "Greek yogurt + granola", meta: "Breakfast · 380 kcal",   time: "08:15" },
  { id: "s2", type: "workout", label: "Morning Energizer",      meta: "15 min · ~120 kcal",     time: "09:00" },
  { id: "s3", type: "water",   label: "Water intake",           meta: "500ml",                  time: "10:30" },
  { id: "s4", type: "break",   label: "Standing break",         meta: "5 min · Shoulder rolls", time: "11:30" },
  { id: "s5", type: "meal",    label: "Chicken wrap",           meta: "Lunch · 520 kcal",       time: "13:00" },
];

const typeColors = {
  meal:    { bg: "var(--accent-bg)", text: "var(--accent-text)" },
  workout: { bg: "var(--amber-bg)",  text: "var(--amber-text)" },
  water:   { bg: "var(--blue-bg)",   text: "var(--blue-text)" },
  break:   { bg: "var(--coral-bg)",  text: "var(--coral-text)" },
};
const typeIcon = { meal: "🥗", workout: "💪", water: "💧", break: "🪑" };

// Map a backend LogEntry to the display shape.
const fromApi = (e) => ({
  id: `api-${e.id}`,
  type: e.type,
  label: e.detail || `${e.type[0].toUpperCase()}${e.type.slice(1)} logged`,
  meta: "Logged via API",
  time: e.timestamp ? new Date(e.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "now",
});

export default function ActivityLog() {
  const [apiLogs, setApiLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [removed, setRemoved] = useState({});
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("water");
  const [newDetail, setNewDetail] = useState("");
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getLogs();
      setApiLogs(Array.isArray(data) ? data.map(fromApi) : []);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);

  const addEntry = async () => {
    try {
      await api.log({ type: newType, detail: newDetail || `${newType} entry`, timestamp: new Date().toISOString() });
      setNewDetail("");
      setAdding(false);
      refresh();
    } catch {
      setOffline(true);
    }
  };

  const logs = [...apiLogs, ...seedLogs].filter((l) => !removed[l.id]);
  const remove = (id) => setRemoved((r) => ({ ...r, [id]: true }));
  const filtered = filter === "all" ? logs : logs.filter((l) => l.type === filter);

  const stats = [
    { icon: Salad,    label: "Meals",    value: `${logs.filter(l=>l.type==="meal").length}`,            color: "var(--accent)" },
    { icon: Dumbbell, label: "Workouts", value: `${logs.filter(l=>l.type==="workout").length}`,         color: "var(--amber)" },
    { icon: Droplets, label: "Water",    value: `${logs.filter(l=>l.type==="water").length * 500}ml`,   color: "var(--blue-text)" },
    { icon: Clock,    label: "Breaks",   value: `${logs.filter(l=>l.type==="break").length}`,           color: "var(--coral-text)" },
  ];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Activity Log 📋</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>
            {offline ? "Backend offline — showing local history" : "Today · synced with your DevWell API"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={refresh} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface)", color: "var(--text2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setAdding((a) => !a)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            <Plus size={14} /> Add entry
          </button>
        </div>
      </div>

      {adding && (
        <div style={{ ...card, display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select value={newType} onChange={e => setNewType(e.target.value)} style={inputStyle}>
            {["water","meal","workout","break"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={newDetail} onChange={e => setNewDetail(e.target.value)} placeholder="Detail (e.g. 500ml, Push-ups)" style={{ ...inputStyle, flex: 1, minWidth: "180px" }} />
          <button onClick={addEntry} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Save</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        {["all","meal","workout","water","break"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: "12.5px", padding: "5px 12px", borderRadius: "20px", border: "0.5px solid var(--border)", cursor: "pointer", transition: "all 0.15s", background: filter === f ? "var(--accent)" : "var(--surface)", color: filter === f ? "white" : "var(--text2)", fontWeight: filter === f ? "500" : "400" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {filtered.map((log, i) => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 0", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--border)" : "none" }}>
              <span style={{ fontSize: "20px" }}>{typeIcon[log.type] || "•"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13.5px", color: "var(--text)", fontWeight: "500" }}>{log.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text3)" }}>{log.meta}</p>
              </div>
              <span style={{ fontSize: "11.5px", padding: "3px 8px", borderRadius: "6px", background: typeColors[log.type]?.bg, color: typeColors[log.type]?.text }}>
                {log.type}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text3)", minWidth: "44px", textAlign: "right" }}>{log.time}</span>
              <button onClick={() => remove(log.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", padding: "2px" }}>
                <X size={14} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--text3)", padding: "24px 0" }}>No entries for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
