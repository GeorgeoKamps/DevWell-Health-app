import { useState } from "react";
import { Flame, Clock, Droplets, Dumbbell, Salad, ArrowRight, CheckCircle2, Circle, Plus, Minus, Armchair } from "lucide-react";
import { useSittingTimer } from "../hooks/useSittingTimer";
import NudgeOverlay from "../components/NudgeOverlay";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const waterBtn = {
  width: "26px", height: "26px", borderRadius: "7px", border: "0.5px solid var(--border)",
  background: "var(--surface2)", color: "var(--text2)", display: "flex",
  alignItems: "center", justifyContent: "center", flexShrink: 0,
};

const HYDRATION_GOAL = 2.5;

function MetricCard({ icon: Icon, label, value, sub, color, children }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text3)", marginBottom: "8px" }}>
        <Icon size={14} /> {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: "600", color: color || "var(--text)" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{sub}</div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timer = useSittingTimer(45 * 60);

  const [meals, setMeals] = useState([
    { name: "Greek yogurt + granola", time: "Breakfast", kcal: 380, done: true },
    { name: "Grilled chicken wrap", time: "Lunch", kcal: 520, done: true },
    { name: "Salmon + quinoa bowl", time: "Dinner", kcal: 610, done: false },
  ]);
  const [exercises, setExercises] = useState([
    { name: "Push-ups", sets: "3 x 15", done: false },
    { name: "Bodyweight squats", sets: "3 x 20", done: false },
    { name: "Plank hold", sets: "3 x 45s", done: false },
    { name: "Hip flexor stretch", sets: "2 x 60s", done: false },
  ]);
  const [water, setWater] = useState(1.2);

  const mealsDone = meals.filter((m) => m.done).length;
  const exDone = exercises.filter((e) => e.done).length;
  const nextMeal = meals.find((m) => !m.done);

  const toggleMeal = (i) => setMeals((ms) => ms.map((m, idx) => (idx === i ? { ...m, done: !m.done } : m)));
  const toggleEx = (i) => setExercises((es) => es.map((e, idx) => (idx === i ? { ...e, done: !e.done } : e)));
  const addWater = (d) => setWater((w) => Math.max(0, Math.round((w + d) * 100) / 100));

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
        <MetricCard
          icon={Clock}
          label="Sitting time"
          value={timer.formattedElapsed}
          sub={timer.breakDue ? "Break is due!" : `Next break in ${timer.formattedRemaining}`}
          color="var(--amber)"
        />
        <MetricCard icon={Droplets} label="Hydration" value={`${water.toFixed(2)}L`} sub={`Goal: ${HYDRATION_GOAL}L`} color="var(--accent)">
          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
            <button onClick={() => addWater(-0.25)} style={waterBtn}><Minus size={13} /></button>
            <button onClick={() => addWater(0.25)} style={waterBtn}><Plus size={13} /></button>
            <div style={{ flex: 1, alignSelf: "center", height: "5px", background: "var(--surface2)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (water / HYDRATION_GOAL) * 100)}%`, height: "100%", background: "var(--accent)", transition: "width 0.2s" }} />
            </div>
          </div>
        </MetricCard>
        <MetricCard icon={Dumbbell} label="Workouts" value={`${exDone} / ${exercises.length}`} sub="Today's session" />
        <MetricCard icon={Salad} label="Meals logged" value={`${mealsDone} / ${meals.length}`} sub={nextMeal ? `${nextMeal.time} pending` : "All done 🎉"} />
      </div>

      {/* Live nudge */}
      <div style={{ background: "var(--amber-bg)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "22px" }}>🪑</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--amber-text)", marginBottom: "4px" }}>
            {timer.breakDue ? "Break is due — time to move! 🧠" : `Next break in ${timer.formattedRemaining} ⏱️`}
          </p>
          <p style={{ fontSize: "13px", color: "var(--amber-text)", lineHeight: "1.5", opacity: 0.85 }}>
            {timer.breaksTaken > 0 ? `${timer.breaksTaken} break${timer.breaksTaken > 1 ? "s" : ""} taken today. ` : ""}
            Sitting too long stiffens your back and tires your eyes — short, frequent breaks keep you sharp.
          </p>
        </div>
        <button onClick={timer.triggerNow} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--amber)", color: "#3d2606", border: "none", fontSize: "13px", fontWeight: "600", padding: "8px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>
          <Armchair size={15} /> Take a break
        </button>
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
            <div key={i} onClick={() => toggleMeal(i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < meals.length - 1 ? "0.5px solid var(--border)" : "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {m.done ? <CheckCircle2 size={15} color="var(--accent)" /> : <Circle size={15} color="var(--text3)" />}
                <div>
                  <p style={{ fontSize: "13.5px", color: "var(--text)", textDecoration: m.done ? "line-through" : "none", opacity: m.done ? 0.6 : 1 }}>{m.name}</p>
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
            <span style={{ fontSize: "12px", color: "var(--text3)" }}>{exDone}/{exercises.length} done</span>
          </div>
          {exercises.map((e, i) => (
            <div key={i} onClick={() => toggleEx(i)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: i < exercises.length - 1 ? "0.5px solid var(--border)" : "none", cursor: "pointer" }}>
              {e.done
                ? <CheckCircle2 size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                : <span style={{ width: "22px", height: "22px", background: "var(--accent-bg)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "var(--accent-text)", flexShrink: 0 }}>{i + 1}</span>}
              <span style={{ flex: 1, fontSize: "13.5px", color: "var(--text)", textDecoration: e.done ? "line-through" : "none", opacity: e.done ? 0.6 : 1 }}>{e.name}</span>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>{e.sets}</span>
            </div>
          ))}
        </div>
      </div>

      <NudgeOverlay
        open={timer.breakDue}
        seed={timer.breaksTaken}
        onTakeBreak={timer.takeBreak}
        onSnooze={() => timer.snooze()}
        onClose={() => timer.snooze()}
      />
    </div>
  );
}
