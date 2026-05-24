import { useState } from "react";

const messages = {
  idle: "Hey! I'm Byte 🐸 Your health sidekick. Click me or pick a tip!",
  meal: "How about a quinoa & roasted veggie bowl? 25 mins, high protein, zero excuse to order pizza. You got this! 🥗",
  stretch: "Stand up! Roll your shoulders back 10 times, slow neck tilt each side. Your spine will thank you. 🙆",
  water: "When did you last drink water? Not coffee — actual water. Go grab a glass. I'll wait here, judging lovingly. 💧",
  break: "You've been in the matrix too long. Step away for 5 mins. Look at something 6m away. Your eyes will remember you fondly. 👀",
};

export default function Byte() {
  const [msg, setMsg] = useState("idle");
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  const jump = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 600);
  };

  const say = (key) => { setMsg(key); setOpen(true); jump(); };
  const toggle = () => { setOpen(o => !o); jump(); };

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      {open && (
        <div style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: "16px 16px 4px 16px", padding: "14px 16px",
          maxWidth: "240px", boxShadow: "var(--shadow-md)",
          animation: "bytePopIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>Byte says</div>
          <p style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: "1.55", marginBottom: "10px" }}>{messages[msg]}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["meal","stretch","water","break"].map(k => (
              <button key={k} onClick={() => say(k)} style={{
                fontSize: "11.5px", padding: "4px 10px", borderRadius: "20px",
                border: "0.5px solid var(--border)", background: "var(--surface2)",
                color: "var(--text2)", cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.target.style.background = "var(--accent-bg)"; e.target.style.color = "var(--accent-text)"; }}
                onMouseLeave={e => { e.target.style.background = "var(--surface2)"; e.target.style.color = "var(--text2)"; }}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <img
        src="/byte.png"
        alt="Byte the frog"
        onClick={toggle}
        style={{
          width: "64px", height: "64px", objectFit: "contain", cursor: "pointer",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
          animation: bounce ? "byteJump 0.6s cubic-bezier(.36,.07,.19,.97)" : "byteFloat 3s ease-in-out infinite",
          transformOrigin: "center bottom",
        }}
      />
      <style>{`
        @keyframes byteFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes byteJump { 0%{transform:translateY(0)} 35%{transform:translateY(-20px) scaleY(1.1)} 65%{transform:translateY(2px) scaleX(1.08) scaleY(0.93)} 100%{transform:translateY(0)} }
        @keyframes bytePopIn { from{opacity:0;transform:scale(0.8) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}
