import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { api } from "../api/client";

const GREETING = "Hey! I'm Byte 🐸 — ask me anything about food, quick workouts, posture, hydration, sleep, or staying sane while coding.";

// One-tap starters that send a real question to the AI.
const STARTERS = [
  { label: "Meal idea", prompt: "Suggest a quick, healthy meal I can make in about 25 minutes." },
  { label: "Desk stretch", prompt: "Give me a 2-minute desk stretch routine for stiff shoulders and neck." },
  { label: "Hydration", prompt: "How much water should I drink during a long coding day, and any tips to remember?" },
  { label: "Quick break", prompt: "I've been coding for hours — what's a good 5-minute reset for my body and eyes?" },
];

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");

export default function Byte() {
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: GREETING }]);
  const scrollRef = useRef(null);

  const jump = () => { setBounce(true); setTimeout(() => setBounce(false), 600); };
  const toggle = () => { setOpen((o) => !o); jump(); };

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    // History = the conversation so far (exclude the static greeting).
    const history = messages.filter((m, i) => !(i === 0 && m.role === "assistant")).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text: content }]);
    setLoading(true);
    try {
      const res = await api.chat(content, history);
      setMessages((m) => [...m, { role: "assistant", text: res.reply, sources: res.sources || [] }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "I'm having trouble reaching my brain right now 🧠💤 — check that the backend is running and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      {open && (
        <div style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: "16px 16px 4px 16px", width: "330px", maxWidth: "82vw",
          boxShadow: "var(--shadow-md)", overflow: "hidden",
          animation: "bytePopIn 0.3s cubic-bezier(.34,1.56,.64,1)",
          display: "flex", flexDirection: "column",
        }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderBottom: "0.5px solid var(--border)" }}>
            <span style={{ fontSize: "18px" }}>🐸</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Byte</div>
              <div style={{ fontSize: "11px", color: "var(--text3)" }}>Your health sidekick</div>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "320px", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", fontSize: "13px", lineHeight: 1.5, padding: "8px 11px",
                  borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  background: m.role === "user" ? "var(--accent)" : "var(--surface2)",
                  color: m.role === "user" ? "#fff" : "var(--text)",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.text}
                  {m.sources?.length > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {m.sources.slice(0, 3).map((s) => (
                        <span key={s} style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", background: "var(--accent-bg)", color: "var(--accent-text)" }}>
                          📚 {prettySource(s)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ fontSize: "13px", padding: "8px 11px", borderRadius: "12px 12px 12px 4px", background: "var(--surface2)", color: "var(--text3)" }}>
                  Byte is thinking<span className="byteDots">…</span>
                </div>
              </div>
            )}

            {/* starter chips, only before the first question */}
            {messages.length <= 1 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                {STARTERS.map((s) => (
                  <button key={s.label} onClick={() => send(s.prompt)} style={{
                    fontSize: "11.5px", padding: "5px 11px", borderRadius: "20px",
                    border: "0.5px solid var(--border)", background: "var(--surface2)",
                    color: "var(--text2)", cursor: "pointer",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <div style={{ display: "flex", gap: "8px", padding: "10px 12px", borderTop: "0.5px solid var(--border)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask Byte anything…"
              style={{
                flex: 1, fontSize: "13px", padding: "9px 11px", borderRadius: "10px",
                border: "0.5px solid var(--border)", background: "var(--surface2)",
                color: "var(--text)", outline: "none",
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
              style={{
                flexShrink: 0, width: "38px", borderRadius: "10px", border: "none",
                background: "var(--accent)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: loading || !input.trim() ? "default" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <img
        src="/frog.webp"
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
        @keyframes byteBlink { 0%,20%{opacity:0} 50%{opacity:1} 100%{opacity:0} }
        .byteDots { animation: byteBlink 1.2s infinite; }
      `}</style>
    </div>
  );
}
