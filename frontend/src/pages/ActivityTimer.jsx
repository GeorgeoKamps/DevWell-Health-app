import { useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Armchair } from "lucide-react";
import { useSittingTimer } from "../hooks/useSittingTimer";
import NudgeOverlay from "../components/NudgeOverlay";

const presets = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
];

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const R = 85;
const C = 2 * Math.PI * R;

export default function ActivityTimer() {
  const [duration, setDuration] = useState(45 * 60);
  const timer = useSittingTimer(duration);

  const choosePreset = (sec) => {
    setDuration(sec);
    timer.reset();
  };

  const offset = C * (1 - Math.min(1, timer.progress));

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Activity Timer ⏱️</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Focus in sprints — DevWell taps you when it's time to move</p>
      </div>

      {/* Preset chips */}
      <div style={{ display: "flex", gap: "8px" }}>
        {presets.map((p) => (
          <button
            key={p.seconds}
            onClick={() => choosePreset(p.seconds)}
            style={{
              fontSize: "13px", fontWeight: "500", padding: "7px 16px", borderRadius: "20px",
              border: "0.5px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
              background: duration === p.seconds ? "var(--accent-bg)" : "var(--surface)",
              color: duration === p.seconds ? "var(--accent-text)" : "var(--text2)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div style={{ position: "relative", width: "220px", height: "220px" }}>
        <svg width="220" height="220" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface2)" strokeWidth="12" />
          <circle
            cx="100" cy="100" r={R} fill="none"
            stroke={timer.breakDue ? "var(--amber)" : "var(--accent)"}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s linear, stroke 0.3s" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "42px", fontWeight: "600", color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
            {timer.formattedRemaining}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
            {timer.breakDue ? "Break time!" : timer.running ? "Focusing…" : "Paused"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={timer.running ? timer.pause : timer.resume}
          disabled={timer.breakDue}
          style={{
            display: "flex", alignItems: "center", gap: "7px", padding: "11px 22px", borderRadius: "10px",
            border: "none", background: "var(--accent)", color: "#fff", fontSize: "14px", fontWeight: "600",
            cursor: timer.breakDue ? "not-allowed" : "pointer", opacity: timer.breakDue ? 0.5 : 1,
          }}
        >
          {timer.running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
        </button>
        <button
          onClick={timer.reset}
          style={{
            display: "flex", alignItems: "center", gap: "7px", padding: "11px 18px", borderRadius: "10px",
            border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text2)",
            fontSize: "14px", fontWeight: "500", cursor: "pointer",
          }}
        >
          <RotateCcw size={15} /> Reset
        </button>
        <button
          onClick={timer.triggerNow}
          style={{
            display: "flex", alignItems: "center", gap: "7px", padding: "11px 18px", borderRadius: "10px",
            border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text2)",
            fontSize: "14px", fontWeight: "500", cursor: "pointer",
          }}
        >
          <Armchair size={15} /> Break now
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "420px" }}>
        <div style={{ ...card, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><Coffee size={13} /> Breaks taken</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "var(--accent)" }}>{timer.breaksTaken}</div>
        </div>
        <div style={{ ...card, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px" }}>Focused this sprint</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "var(--text)" }}>{timer.formattedElapsed}</div>
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
