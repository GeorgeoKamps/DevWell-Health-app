import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { api } from "../api/client";

const suggestions = ["What should I eat for high energy?", "Give me a 10-min desk workout", "How much water should I drink?", "Tips for better sleep as a dev"];

const initialMessages = [
  { role: "assistant", text: "Hey! I'm your DevWell health assistant 🐸 Ask me anything about nutrition, exercise, or staying healthy at your desk." },
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const data = await api.chat(msg);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "I couldn't reach the DevWell server. Make sure the backend is running on http://localhost:8000 and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "28px 32px 0" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Health Chat 💬</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Ask Byte anything about your health</p>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{ fontSize: "12.5px", padding: "6px 12px", borderRadius: "20px", border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text2)", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.background = "var(--accent-bg)"; e.target.style.color = "var(--accent-text)"; e.target.style.borderColor = "var(--accent)"; }}
            onMouseLeave={e => { e.target.style.background = "var(--surface)"; e.target.style.color = "var(--text2)"; e.target.style.borderColor = "var(--border)"; }}
          >{s}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: m.role === "assistant" ? "var(--accent-bg)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: m.role === "assistant" ? "var(--accent)" : "var(--text3)" }}>
              {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div style={{ maxWidth: "70%", padding: "11px 14px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role === "user" ? "var(--accent)" : "var(--surface)", color: m.role === "user" ? "white" : "var(--text)", fontSize: "13.5px", lineHeight: "1.6", border: m.role === "user" ? "none" : "0.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}><Bot size={16} /></div>
            <div style={{ padding: "11px 14px", borderRadius: "12px 12px 12px 4px", background: "var(--surface)", border: "0.5px solid var(--border)", display: "flex", gap: "4px", alignItems: "center" }}>
              {[0,1,2].map(d => <span key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--text3)", animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite`, display: "block" }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "16px 0 24px", display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about nutrition, workouts, habits..."
          style={{ flex: 1, padding: "11px 16px", borderRadius: "10px", border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "13.5px", outline: "none" }}
        />
        <button onClick={() => send()} style={{ width: "42px", height: "42px", borderRadius: "10px", background: "var(--accent)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", flexShrink: 0 }}>
          <Send size={16} />
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  );
}
