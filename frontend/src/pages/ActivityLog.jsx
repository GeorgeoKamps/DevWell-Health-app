import { useState } from "react";
import { Salad, Dumbbell, Droplets, Clock, Plus, X } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const initialLogs = [
  { id: 1, type: "meal",    icon: "🥗", label: "Greek yogurt + granola", meta: "Breakfast · 380 kcal",  time: "08:15" },
  { id: 2, type: "workout", icon: "💪", label: "Morning Energizer",      meta: "15 min · ~120 kcal",   time: "09:00" },
  { id: 3, type: "water",   icon: "💧", label: "Water intake",           meta: "500ml",                time: "10:30" },
  { id: 4, type: "break",   icon: "🪑", label: "Standing break",         meta: "5 min · Shoulder rolls",time: "11:30" },
  { id: 5, type: "meal",    icon: "🥗", label: "Chicken wrap",           meta: "Lunch · 520 kcal",     time: "13:00" },
  { id: 6, type: "water",   icon: "💧", label: "Water intake",           meta: "500ml",                time: "14:45" },
  { id: 7, type: "workout", icon: "💪", label: "Desk Break Stretch",     meta: "10 min · ~60 kcal",    time: "15:30" },
];

const typeColors = {
  meal:    { bg: "var(--accent-bg)",  text: "var(--accent-text)" },
  workout: { bg: "var(--amber-bg)",   text: "var(--amber-text)" },
  water:   { bg: "var(--blue-bg)",    text: "var(--blue-text)" },
  break:   { bg: "var(--coral-bg)",   text: "var(--coral-text)" },
};

export default function ActivityLog() {
  const [logs, setLogs] = useState(initialLogs);
  const [filter, setFilter] = useState("all");

  const remove = (id) => setLogs(l => l.filter(x => x.id !== id));
  const filtered = filter === "all" ? logs : logs.filter(l => l.type === filter);

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Activity Log 📋</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Today · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
          <Plus size={14} /> Add entry
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { icon: Salad,    label: "Meals",    value: `${logs.filter(l=>l.type==="meal").length}`,    color: "var(--accent)" },
          { icon: Dumbbell, label: "Workouts", value: `${logs.filter(l=>l.type==="workout").length}`, color: "var(--amber)" },
          { icon: Droplets, label: "Water",    value: `${logs.filter(l=>l.type==="water").length * 500}ml`, color: "var(--blue-text)" },
          { icon: Clock,    label: "Breaks",   value: `${logs.filter(l=>l.type==="break").length}`,   color: "var(--coral-text)" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px" }}>
        {["all","meal","workout","water","break"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: "12.5px", padding: "5px 12px", borderRadius: "20px", border: "0.5px solid var(--border)", cursor: "pointer", transition: "all 0.15s", background: filter === f ? "var(--accent)" : "var(--surface)", color: filter === f ? "white" : "var(--text2)", fontWeight: filter === f ? "500" : "400" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {filtered.map((log, i) => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 0", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--border)" : "none" }}>
              <span style={{ fontSize: "20px" }}>{log.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13.5px", color: "var(--text)", fontWeight: "500" }}>{log.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text3)" }}>{log.meta}</p>
              </div>
              <span style={{ fontSize: "11.5px", padding: "3px 8px", borderRadius: "6px", background: typeColors[log.type].bg, color: typeColors[log.type].text }}>
                {log.type}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text3)", minWidth: "36px", textAlign: "right" }}>{log.time}</span>
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
