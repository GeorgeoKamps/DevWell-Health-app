import { useState, useEffect, useCallback } from "react";
import { Search, BookOpen, FileText, Loader2 } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");
const catLabel = { recipes: "Recipes", exercises: "Exercises", ergonomics: "Ergonomics", mental_wellness: "Mental wellness" };
const catColor = {
  recipes: { bg: "var(--accent-bg)", text: "var(--accent-text)" },
  exercises: { bg: "var(--amber-bg)", text: "var(--amber-text)" },
  ergonomics: { bg: "var(--blue-bg)", text: "var(--blue-text)" },
  mental_wellness: { bg: "var(--coral-bg)", text: "var(--coral-text)" },
};

const suggestions = ["high protein meal", "back pain stretches", "monitor setup", "manage stress"];

export default function Library() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categories, setCategories] = useState({});
  const [offline, setOffline] = useState(false);

  const loadKnowledge = useCallback(async () => {
    try {
      const data = await api.knowledge();
      setCategories(data.categories || {});
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadKnowledge(); }, [loadKnowledge]);

  const runSearch = async (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.search(q);
      setResults(data.results || []);
      setOffline(false);
    } catch {
      setResults([]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const cat = (c) => catColor[c] || { bg: "var(--surface2)", text: "var(--text2)" };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "820px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} color="var(--accent)" /> Knowledge Library
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>
          {offline ? "Backend offline — start it to search" : "Search the same curated tips that ground Byte's answers"}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "0 12px" }}>
          <Search size={16} color="var(--text3)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search nutrition, exercises, ergonomics, wellness…"
            style={{ flex: 1, padding: "11px 0", border: "none", background: "transparent", color: "var(--text)", fontSize: "13.5px", outline: "none" }}
          />
        </div>
        <button onClick={() => runSearch()} disabled={loading} style={{ padding: "0 18px", borderRadius: "10px", background: "var(--accent)", color: "white", border: "none", display: "flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: "600", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? <Loader2 size={15} style={{ animation: "libSpin 0.8s linear infinite" }} /> : <Search size={15} />}
          Search
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => runSearch(s)} style={{ fontSize: "12.5px", padding: "6px 12px", borderRadius: "20px", border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text2)", cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {!searched ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
          {Object.entries(categories).map(([c, docs]) => (
            <div key={c} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", borderRadius: "20px", background: cat(c).bg, color: cat(c).text }}>{catLabel[c] || c}</span>
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>{docs.length} doc{docs.length !== 1 ? "s" : ""}</span>
              </div>
              {docs.map((d) => (
                <div key={d} onClick={() => runSearch(prettySource(d))} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--text2)", padding: "4px 0", cursor: "pointer" }}>
                  <FileText size={13} color="var(--text3)" /> {prettySource(d)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.length === 0 && !loading && (
            <div style={{ ...card, fontSize: "13px", color: "var(--text3)", textAlign: "center" }}>No matches found.</div>
          )}
          {results.map((r, i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", borderRadius: "20px", background: cat(r.category).bg, color: cat(r.category).text }}>{catLabel[r.category] || r.category}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", color: "var(--text)" }}>{prettySource(r.source)}</span>
                </div>
                {r.score != null && <span style={{ fontSize: "11px", color: "var(--text3)" }}>relevance {Math.round(r.score * 100)}%</span>}
              </div>
              <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: "1.55", whiteSpace: "pre-wrap" }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes libSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
