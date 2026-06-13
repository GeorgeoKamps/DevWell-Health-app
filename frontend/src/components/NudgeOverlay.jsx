import { Armchair, Check, Clock3, X } from "lucide-react";

const nudges = [
  "You've been git blame-ing for 45 mins straight. Stand up before your chair files a bug report. 🪑",
  "Compile time for your spine. Stand up and stretch — no merge conflicts allowed. 🧘",
  "Your last commit was 'fix later'. Your body says 'stretch now'. ⏱️",
  "You've been in the zone so long the zone wants a break. Step away for 5. 🧠",
  "Uptime: too long. Time to redeploy your posture. 🚀",
];

const breaks = [
  { title: "Shoulder rolls", detail: "10 slow rolls back, then 10 forward. Drop the shoulders away from your ears." },
  { title: "Eye reset (20-20-20)", detail: "Look at something ~6 metres away for 20 seconds. Let your eyes refocus." },
  { title: "Standing calf raises", detail: "20 reps. Get the blood moving in those long-forgotten legs." },
  { title: "Neck tilts + wrist circles", detail: "Tilt ear to shoulder each side, hold 10s. Then 10 wrist circles each way." },
];

export default function NudgeOverlay({ open, seed = 0, nudge: nudgeProp, brk: brkProp, onTakeBreak, onSnooze, onClose }) {
  if (!open) return null;

  const nudge = nudgeProp || nudges[seed % nudges.length];
  const brk = brkProp || breaks[seed % breaks.length];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", animation: "nudgeFade 0.25s ease",
      }}
    >
      <div
        style={{
          background: "var(--surface)", borderRadius: "20px",
          border: "0.5px solid var(--border)", boxShadow: "var(--shadow-md)",
          width: "100%", maxWidth: "420px", padding: "28px",
          position: "relative", textAlign: "center",
          animation: "nudgePop 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss"
            style={{
              position: "absolute", top: "14px", right: "14px",
              background: "transparent", border: "none", color: "var(--text3)",
              display: "flex", padding: "4px", borderRadius: "6px",
            }}
          >
            <X size={18} />
          </button>
        )}

        <div
          style={{
            width: "56px", height: "56px", margin: "0 auto 16px",
            borderRadius: "16px", background: "var(--amber-bg)", color: "var(--amber-text)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "nudgeWiggle 1.2s ease-in-out infinite",
          }}
        >
          <Armchair size={28} />
        </div>

        <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--amber-text)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
          Break time
        </div>
        <p style={{ fontSize: "15.5px", color: "var(--text)", lineHeight: "1.5", marginBottom: "18px" }}>
          {nudge}
        </p>

        <div style={{ background: "var(--accent-bg)", borderRadius: "12px", padding: "14px 16px", textAlign: "left", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--accent-text)", marginBottom: "4px" }}>
            Try this 5-min reset · {brk.title}
          </div>
          <p style={{ fontSize: "13px", color: "var(--accent-text)", opacity: 0.9, lineHeight: "1.5" }}>
            {brk.detail}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onSnooze}
            style={{
              flex: 1, padding: "11px", borderRadius: "10px",
              border: "0.5px solid var(--border)", background: "var(--surface2)",
              color: "var(--text2)", fontSize: "13.5px", fontWeight: "500",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            <Clock3 size={15} /> Snooze 5 min
          </button>
          <button
            onClick={onTakeBreak}
            style={{
              flex: 1.4, padding: "11px", borderRadius: "10px", border: "none",
              background: "var(--accent)", color: "#fff", fontSize: "13.5px", fontWeight: "600",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            <Check size={16} /> I stretched
          </button>
        </div>
      </div>

      <style>{`
        @keyframes nudgeFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes nudgePop { from { opacity: 0; transform: scale(0.9) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes nudgeWiggle { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
      `}</style>
    </div>
  );
}
