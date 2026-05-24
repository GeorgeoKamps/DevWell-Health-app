import { Flame, Clock, Droplets, Dumbbell, Salad, ArrowRight, CheckCircle2, Circle } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text3)", marginBottom: "8px" }}>
        <Icon size={14} /> {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: "600", color: color || "var(--text)" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{sub}</div>
    </div>
  );
}

const meals = [
  { name: "Greek yogurt + granola", time: "Breakfast", kcal: 380, done: true },
  { name: "Grilled chicken wrap",   time: "Lunch",     kcal: 520, done: true },
  { name: "Salmon + quinoa bowl",   time: "Dinner",    kcal: 610, done: false },
];

const exercises = [
  { name: "Push-ups",             sets: "3 × 15" },
  { name: "Bodyweight squats",    sets: "3 × 20" },
  { name: "Plank hold",           sets: "3 × 45s" },
  { name: "Hip flexor stretch",   sets: "2 × 60s" },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Good morning, George 👋</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>{today} · Stay hydrated today</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--amber-bg)", color: "var(--amber-text)", fontSize: "13px", fontWeight: "500", padding: "6px 14px", borderRadius: "20px" }}>
          <Flame size={15} /> 7-day streak
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        <MetricCard icon={Clock}    label="Sitting time" value="2h 47m"  sub="Next break in 13 min"  color="var(--amber)" />
        <MetricCard icon={Droplets} label="Hydration"    value="1.2L"    sub="Goal: 2.5L"             color="var(--accent)" />
        <MetricCard icon={Dumbbell} label="Workouts"     value="3 / 5"   sub="This week" />
        <MetricCard icon={Salad}    label="Meals logged" value="2 / 3"   sub="Dinner pending" />
      </div>

      {/* Nudge */}
      <div style={{ background: "var(--amber-bg)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "22px" }}>🪑</span>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--amber-text)", marginBottom: "4px" }}>You've been in the zone for 47 mins 🧠</p>
          <p style={{ fontSize: "13px", color: "var(--amber-text)", lineHeight: "1.5", opacity: 0.85 }}>Time to stand up and let your back remember it exists. Try 10 shoulder rolls + 20 standing calf raises.</p>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Meals */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontWeight: "500", fontSize: "14px", color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}><Salad size={15} color="var(--accent)" /> Today's meals</span>
            <span style={{ fontSize: "12px", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>View plan <ArrowRight size={12} /></span>
          </div>
          {meals.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < meals.length - 1 ? "0.5px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {m.done ? <CheckCircle2 size={15} color="var(--accent)" /> : <Circle size={15} color="var(--text3)" />}
                <div>
                  <p style={{ fontSize: "13.5px", color: "var(--text)" }}>{m.name}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--text3)" }}>{m.time} · {m.kcal} kcal</p>
                </div>
              </div>
              <span style={{ fontSize: "11.5px", padding: "3px 8px", borderRadius: "6px", background: m.done ? "var(--accent-bg)" : "var(--coral-bg)", color: m.done ? "var(--accent-text)" : "var(--coral-text)" }}>
                {m.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>

        {/* Workout */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontWeight: "500", fontSize: "14px", color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}><Dumbbell size={15} color="var(--accent)" /> Today's workout</span>
            <span style={{ fontSize: "12px", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>Start <ArrowRight size={12} /></span>
          </div>
          {exercises.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: i < exercises.length - 1 ? "0.5px solid var(--border)" : "none" }}>
              <span style={{ width: "22px", height: "22px", background: "var(--accent-bg)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "var(--accent-text)", flexShrink: 0 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: "13.5px", color: "var(--text)" }}>{e.name}</span>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>{e.sets}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
