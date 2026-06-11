import { useState } from "react";
import { Wind, Activity, Send, Loader2, HeartHandshake, FileText } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");

const prompts = [
  "I've been debugging for hours and I'm losing it",
  "Feeling overwhelmed by my backlog",
  "Can't focus today",
  "Stressed about a deadline",
];

function SuggestionCard({ icon: Icon, label, title, detail }) {
  return (
    <div style={{ ...card, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--accent)", fontWeight: "600", marginBottom: "8px" }}>
        <Icon size={14} /> {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "var(--text2)", lineHeight: "1.5" }}>{detail}</div>
    </div>
  );
}

export default function Mood() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const check = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput(msg);
    setLoading(true);
    setError(false);
    try {
      const data = await api.mood(msg);
      setResult(data);
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "760px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Mood Check 🧘</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Tell Byte how you're feeling and get a quick reset</p>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {prompts.map((p, i) => (
          <button key={i} onClick={() => check(p)} style={{ fontSize: "12.5px", padding: "6px 12px", borderRadius: "20px", border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text2)", cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind?"
          rows={2}
          style={{ flex: 1, padding: "11px 14px", borderRadius: "10px", border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "13.5px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
        />
        <button onClick={() => check()} disabled={loading} style={{ alignSelf: "stretch", padding: "0 18px", borderRadius: "10px", background: "var(--accent)", color: "white", border: "none", display: "flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: "600", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? <Loader2 size={15} style={{ animation: "moodSpin 0.8s linear infinite" }} /> : <Send size={15} />}
          {loading ? "Thinking" : "Check in"}
        </button>
      </div>

      {error && <div style={{ ...card, color: "var(--coral-text)", fontSize: "13px" }}>Couldn't reach the server. Make sure the backend is running on http://localhost:8000.</div>}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ ...card, display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--accent-bg)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-text)", background: "var(--accent-bg)", padding: "2px 8px", borderRadius: "20px" }}>
                {result.mood}
              </span>
              <p style={{ fontSize: "14.5px", color: "var(--text)", lineHeight: "1.55", marginTop: "8px" }}>{result.reply}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <SuggestionCard icon={Wind} label="Breathing" title={result.breathing.title} detail={result.breathing.detail} />
            <SuggestionCard icon={Activity} label="Physical reset" title={result.physical.title} detail={result.physical.detail} />
          </div>
          {result.sources && result.sources.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={11} /> Based on:</span>
              {result.sources.map((s, i) => (
                <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--surface2)", color: "var(--text2)", border: "0.5px solid var(--border)" }}>{prettySource(s)}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes moodSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
