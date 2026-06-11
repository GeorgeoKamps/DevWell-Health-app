import { useState } from "react";
import { Dumbbell, Timer, Flame, CheckCircle2, Circle, ChevronRight, Check, Sparkles, Loader2, FileText } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };
const inputStyle = { padding: "8px 11px", borderRadius: "8px", border: "0.5px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", outline: "none" };

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");

const plans = [
  {
    title: "Morning Energizer", duration: "15 min", level: "Easy", tag: "var(--accent-bg)", tagText: "var(--accent-text)",
    exercises: [
      { name: "Jumping jacks", sets: "2 × 30s" },
      { name: "Arm circles", sets: "2 × 20" },
      { name: "High knees", sets: "2 × 30s" },
      { name: "Neck rolls", sets: "1 × 60s" },
    ],
  },
  {
    title: "Desk Break Stretch", duration: "10 min", level: "Easy", tag: "var(--blue-bg)", tagText: "var(--blue-text)",
    exercises: [
      { name: "Shoulder rolls", sets: "3 × 10" },
      { name: "Seated twist", sets: "2 × 30s" },
      { name: "Hip flexor stretch", sets: "2 × 45s" },
      { name: "Wrist stretch", sets: "2 × 30s" },
    ],
  },
  {
    title: "Lunch Power Session", duration: "20 min", level: "Medium", tag: "var(--amber-bg)", tagText: "var(--amber-text)",
    exercises: [
      { name: "Push-ups", sets: "3 × 15" },
      { name: "Bodyweight squats", sets: "3 × 20" },
      { name: "Plank", sets: "3 × 40s" },
      { name: "Lunges", sets: "2 × 12 each" },
    ],
  },
  {
    title: "Evening Wind Down", duration: "15 min", level: "Easy", tag: "var(--coral-bg)", tagText: "var(--coral-text)",
    exercises: [
      { name: "Child's pose", sets: "2 × 60s" },
      { name: "Cat-cow stretch", sets: "2 × 10" },
      { name: "Seated forward fold", sets: "2 × 45s" },
      { name: "Deep breathing", sets: "5 min" },
    ],
  },
];

const parseMin = (d) => parseInt(d, 10) || 0;

export default function Workout() {
  const [active, setActive] = useState(null);
  const [done, setDone] = useState({});

  // Generator (calls the backend /workout endpoint)
  const [genMin, setGenMin] = useState(20);
  const [genFocus, setGenFocus] = useState("back pain");
  const [genSession, setGenSession] = useState(null);
  const [genDone, setGenDone] = useState({});
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState(false);

  const generate = async () => {
    setGenLoading(true);
    setGenError(false);
    try {
      const data = await api.getWorkout({ available_minutes: Number(genMin) || 20, focus: genFocus, level: "easy" });
      setGenSession(data);
      setGenDone({});
    } catch {
      setGenError(true);
      setGenSession(null);
    } finally {
      setGenLoading(false);
    }
  };

  const toggle = (pi, ei) => {
    const key = `${pi}-${ei}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
  };

  const doneCount = (pi) => plans[pi].exercises.reduce((n, _, ei) => n + (done[`${pi}-${ei}`] ? 1 : 0), 0);
  const isComplete = (pi) => doneCount(pi) === plans[pi].exercises.length;

  const completedSessions = plans.reduce((n, _, pi) => n + (isComplete(pi) ? 1 : 0), 0);
  const activeMin = plans.reduce((sum, p, pi) => sum + (isComplete(pi) ? parseMin(p.duration) : 0), 0);
  const calories = Math.round(activeMin * 7);

  const stats = [
    { icon: Dumbbell, label: "Sessions done", value: `${completedSessions} / ${plans.length}` },
    { icon: Timer, label: "Total active time", value: `${activeMin} min` },
    { icon: Flame, label: "Calories burned", value: `~${calories} kcal` },
  ];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Workouts 💪</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Quick sessions designed for your desk life</p>
      </div>

      {/* AI generator */}
      <div style={{ ...card, border: "0.5px solid var(--accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
          <Sparkles size={15} color="var(--accent)" />
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>Generate a session</h3>
          <span style={{ fontSize: "11px", color: "var(--text3)" }}>grounded in DevWell's knowledge base</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: "13px", color: "var(--text2)", display: "flex", alignItems: "center", gap: "6px" }}>
            I have
            <input type="number" min="5" max="90" value={genMin} onChange={e => setGenMin(e.target.value)} style={{ ...inputStyle, width: "64px" }} /> min
          </label>
          <label style={{ fontSize: "13px", color: "var(--text2)", display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: "200px" }}>
            and want to focus on
            <input type="text" value={genFocus} onChange={e => setGenFocus(e.target.value)} placeholder="e.g. back pain, energy" style={{ ...inputStyle, flex: 1 }} />
          </label>
          <button onClick={generate} disabled={genLoading} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "500", cursor: genLoading ? "default" : "pointer", opacity: genLoading ? 0.7 : 1 }}>
            {genLoading ? <Loader2 size={14} style={{ animation: "wSpin 0.8s linear infinite" }} /> : <Sparkles size={14} />}
            {genLoading ? "Generating…" : "Generate"}
          </button>
        </div>

        {genError && <p style={{ fontSize: "12.5px", color: "var(--coral-text)", marginTop: "12px" }}>Couldn't reach the backend. Make sure it's running on http://localhost:8000.</p>}

        {genSession && (
          <div style={{ marginTop: "14px", background: "var(--surface2)", borderRadius: "10px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text)" }}>{genSession.title}</span>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>{genSession.duration_min} min · {genSession.level}</span>
            </div>
            {genSession.exercises.map((ex, ei) => (
              <div key={ei} onClick={() => setGenDone(d => ({ ...d, [ei]: !d[ei] }))} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", cursor: "pointer" }}>
                {genDone[ei] ? <CheckCircle2 size={15} color="var(--accent)" /> : <Circle size={15} color="var(--text3)" />}
                <span style={{ flex: 1, fontSize: "13px", color: "var(--text)", textDecoration: genDone[ei] ? "line-through" : "none", opacity: genDone[ei] ? 0.6 : 1 }}>{ex.name}</span>
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>{ex.sets}</span>
              </div>
            ))}
            {genSession.sources && genSession.sources.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "10px", paddingTop: "10px", borderTop: "0.5px solid var(--border)" }}>
                <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={11} /> Sources:</span>
                {genSession.sources.map((s, si) => (
                  <span key={si} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--surface)", color: "var(--text2)", border: "0.5px solid var(--border)" }}>{prettySource(s)}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {plans.map((plan, pi) => {
          const count = doneCount(pi);
          const complete = isComplete(pi);
          return (
            <div key={pi} style={{ ...card, border: complete ? "0.5px solid var(--accent)" : card.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {plan.title}
                    {complete && <Check size={14} color="var(--accent)" />}
                  </h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ fontSize: "11.5px", padding: "2px 8px", borderRadius: "6px", background: plan.tag, color: plan.tagText }}>{plan.level}</span>
                    <span style={{ fontSize: "11.5px", padding: "2px 8px", borderRadius: "6px", background: "var(--surface2)", color: "var(--text3)" }}>{plan.duration}</span>
                  </div>
                </div>
                <button onClick={() => setActive(active === pi ? null : pi)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--accent)", color: "white", border: "none", borderRadius: "7px", padding: "6px 11px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
                  {active === pi ? "Close" : "Start"} <ChevronRight size={12} />
                </button>
              </div>

              <div style={{ height: "5px", background: "var(--surface2)", borderRadius: "3px", overflow: "hidden", marginBottom: active === pi ? "12px" : "10px" }}>
                <div style={{ width: `${(count / plan.exercises.length) * 100}%`, height: "100%", background: "var(--accent)", transition: "width 0.25s" }} />
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
          );
        })}
      </div>

      <style>{`@keyframes wSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
