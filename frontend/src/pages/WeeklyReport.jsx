import { TrendingUp, Droplets, Dumbbell, Salad, Clock, Award } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const workouts = [1,1,0,1,0,1,0];
const water    = [2.1,1.8,2.5,1.4,2.2,2.0,1.7];
const sitting  = [6.2,7.1,5.8,8.0,6.5,3.2,2.1];

function Bar({ value, max, color }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "28px", height: "80px", background: "var(--surface2)", borderRadius: "6px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ width: "100%", height: `${(value / max) * 100}%`, background: color, borderRadius: "6px", transition: "height 0.6s ease" }} />
      </div>
    </div>
  );
}

function StatRow({ label, value, note, good }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
      <span style={{ fontSize: "13.5px", color: "var(--text)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13.5px", fontWeight: "500", color: good ? "var(--accent)" : "var(--amber)" }}>{value}</span>
        <span style={{ fontSize: "11.5px", color: "var(--text3)" }}>{note}</span>
      </div>
    </div>
  );
}

export default function WeeklyReport() {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Weekly Report 📊</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>May 13 – May 19, 2025</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent-bg)", color: "var(--accent-text)", fontSize: "13px", fontWeight: "500", padding: "6px 14px", borderRadius: "20px" }}>
          <Award size={14} /> Score: 74 / 100
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { icon: Dumbbell, label: "Workouts done",   value: "4 / 5",   color: "var(--accent)" },
          { icon: Droplets, label: "Avg hydration",   value: "1.96L",   color: "var(--blue-text)" },
          { icon: Clock,    label: "Avg sitting",     value: "5.6h",    color: "var(--amber)" },
          { icon: Salad,    label: "Meals logged",    value: "18 / 21", color: "var(--accent)" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        {[
          { title: "Workouts", data: workouts, max: 1,   color: "var(--accent)" },
          { title: "Water (L)", data: water,   max: 2.5, color: "var(--blue-text)" },
          { title: "Sitting (h)", data: sitting, max: 10, color: "var(--amber)" },
        ].map(({ title, data, max, color }) => (
          <div key={title} style={card}>
            <h3 style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", marginBottom: "12px" }}>{title}</h3>
            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
              {data.map((v, i) => <Bar key={i} value={v} max={max} color={color} />)}
            </div>
            <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
              {days.map(d => <div key={d} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: "var(--text3)" }}>{d}</div>)}
            </div>
          </div>
        ))}
      </div>

      {/* AI insights */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
          <TrendingUp size={15} color="var(--accent)" />
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>Byte's insights</h3>
        </div>
        <StatRow label="Workout consistency" value="80%"  note="4 of 5 sessions" good />
        <StatRow label="Hydration goal"      value="78%"  note="Avg 1.96L / 2.5L goal" />
        <StatRow label="Sitting breaks"      value="62%"  note="Missed 38% of alerts" />
        <StatRow label="Meal logging"        value="86%"  note="18 of 21 meals logged" good />
        <div style={{ marginTop: "14px", background: "var(--accent-bg)", borderRadius: "10px", padding: "12px 14px" }}>
          <p style={{ fontSize: "13.5px", color: "var(--accent-text)", lineHeight: "1.6" }}>
            💡 <strong>Next week focus:</strong> You're nailing workouts — great job! Your main area to improve is hydration and sitting breaks. Try setting a water reminder every 90 mins and actually standing up when Byte nudges you. 🐸
          </p>
        </div>
      </div>
    </div>
  );
}
