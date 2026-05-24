import { useState } from "react";
import { Dumbbell, Timer, Flame, CheckCircle2, Circle, ChevronRight } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const plans = [
  {
    title: "Morning Energizer",
    duration: "15 min",
    level: "Easy",
    tag: "var(--accent-bg)",
    tagText: "var(--accent-text)",
    exercises: [
      { name: "Jumping jacks", sets: "2 × 30s" },
      { name: "Arm circles", sets: "2 × 20" },
      { name: "High knees", sets: "2 × 30s" },
      { name: "Neck rolls", sets: "1 × 60s" },
    ],
  },
  {
    title: "Desk Break Stretch",
    duration: "10 min",
    level: "Easy",
    tag: "var(--blue-bg)",
    tagText: "var(--blue-text)",
    exercises: [
      { name: "Shoulder rolls", sets: "3 × 10" },
      { name: "Seated twist", sets: "2 × 30s" },
      { name: "Hip flexor stretch", sets: "2 × 45s" },
      { name: "Wrist stretch", sets: "2 × 30s" },
    ],
  },
  {
    title: "Lunch Power Session",
    duration: "20 min",
    level: "Medium",
    tag: "var(--amber-bg)",
    tagText: "var(--amber-text)",
    exercises: [
      { name: "Push-ups", sets: "3 × 15" },
      { name: "Bodyweight squats", sets: "3 × 20" },
      { name: "Plank", sets: "3 × 40s" },
      { name: "Lunges", sets: "2 × 12 each" },
    ],
  },
  {
    title: "Evening Wind Down",
    duration: "15 min",
    level: "Easy",
    tag: "var(--coral-bg)",
    tagText: "var(--coral-text)",
    exercises: [
      { name: "Child's pose", sets: "2 × 60s" },
      { name: "Cat-cow stretch", sets: "2 × 10" },
      { name: "Seated forward fold", sets: "2 × 45s" },
      { name: "Deep breathing", sets: "5 min" },
    ],
  },
];

export default function Workout() {
  const [active, setActive] = useState(null);
  const [done, setDone] = useState({});

  const toggle = (pi, ei) => {
    const key = `${pi}-${ei}`;
    setDone(d => ({ ...d, [key]: !d[key] }));
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Workouts 💪</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Quick sessions designed for your desk life</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {[{ icon: Dumbbell, label: "Sessions this week", value: "3 / 5" }, { icon: Timer, label: "Total active time", value: "47 min" }, { icon: Flame, label: "Calories burned", value: "~380 kcal" }].map(({ icon: Icon, label, value }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {plans.map((plan, pi) => (
          <div key={pi} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "4px" }}>{plan.title}</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ fontSize: "11.5px", padding: "2px 8px", borderRadius: "6px", background: plan.tag, color: plan.tagText }}>{plan.level}</span>
                  <span style={{ fontSize: "11.5px", padding: "2px 8px", borderRadius: "6px", background: "var(--surface2)", color: "var(--text3)" }}>{plan.duration}</span>
                </div>
              </div>
              <button onClick={() => setActive(active === pi ? null : pi)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--accent)", color: "white", border: "none", borderRadius: "7px", padding: "6px 11px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
                {active === pi ? "Close" : "Start"} <ChevronRight size={12} />
              </button>
            </div>

            {active === pi ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {plan.exercises.map((ex, ei) => {
                  const key = `${pi}-${ei}`;
                  return (
                    <div key={ei} onClick={() => toggle(pi, ei)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "8px", background: done[key] ? "var(--accent-bg)" : "var(--surface2)", cursor: "pointer", transition: "background 0.15s" }}>
                      {done[key] ? <CheckCircle2 size={15} color="var(--accent)" /> : <Circle size={15} color="var(--text3)" />}
                      <span style={{ flex: 1, fontSize: "13px", color: done[key] ? "var(--accent-text)" : "var(--text)", textDecoration: done[key] ? "line-through" : "none" }}>{ex.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--text3)" }}>{ex.sets}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {plan.exercises.map((ex, ei) => (
                  <div key={ei} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text3)", padding: "3px 0" }}>
                    <span>{ex.name}</span><span>{ex.sets}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
