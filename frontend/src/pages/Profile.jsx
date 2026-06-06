import { useState, useEffect, useCallback } from "react";
import { User, Save } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow)" };

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "0.5px solid var(--border)", background: "var(--surface2)",
  color: "var(--text)", fontSize: "13.5px", outline: "none",
};

const labelStyle = { fontSize: "12px", color: "var(--text3)", marginBottom: "5px", display: "block" };

const DEFAULT_FORM = { name: "George", age: "27", weight: "78", height: "180", diet: "No restrictions", level: "Intermediate", goal: "Stay healthy", hours: "8-10" };

const fromApi = (p) => ({
  name: p.name ?? "", age: String(p.age ?? ""), weight: String(p.weight_kg ?? ""), height: String(p.height_cm ?? ""),
  diet: p.diet ?? "No restrictions", level: p.fitness_level ?? "Intermediate", goal: p.goal ?? "Stay healthy", hours: p.screen_hours ?? "8-10",
});
const toApi = (f) => ({
  name: f.name, age: Number(f.age) || null, weight_kg: Number(f.weight) || null, height_cm: Number(f.height) || null,
  diet: f.diet, fitness_level: f.level, goal: f.goal, screen_hours: f.hours,
});

export default function Profile() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      setForm(fromApi(data));
    } catch {
      /* keep defaults if backend is offline */
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadProfile(); }, [loadProfile]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus("saving");
    try {
      await api.saveProfile(toApi(form));
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const btn = {
    saving: { bg: "var(--surface2)", fg: "var(--text2)", label: "Saving…" },
    saved: { bg: "var(--accent-bg)", fg: "var(--accent-text)", label: "Saved! ✓" },
    error: { bg: "var(--coral-bg)", fg: "var(--coral-text)", label: "Backend offline" },
    idle: { bg: "var(--accent)", fg: "white", label: "Save changes" },
  }[status];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Profile ⚙️</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Your preferences power the AI recommendations · saved to your DevWell API</p>
      </div>

      <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
          <User size={28} />
        </div>
        <div>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>{form.name}</p>
          <p style={{ fontSize: "13px", color: "var(--text3)" }}>Developer · DevWell member</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {["🐸 Streak: 7", "💪 Level: " + form.level].map(tag => (
            <span key={tag} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "20px", background: "var(--accent-bg)", color: "var(--accent-text)" }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={card}>
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "14px" }}>Personal info</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[["Name", "name", "text"], ["Age", "age", "number"], ["Weight (kg)", "weight", "number"], ["Height (cm)", "height", "number"]].map(([label, key, type]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "14px" }}>Health preferences</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Diet</label>
              <select value={form.diet} onChange={e => update("diet", e.target.value)} style={inputStyle}>
                {["No restrictions","Vegetarian","Vegan","Gluten-free","Dairy-free","Keto"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fitness level</label>
              <select value={form.level} onChange={e => update("level", e.target.value)} style={inputStyle}>
                {["Beginner","Intermediate","Advanced"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Main goal</label>
              <select value={form.goal} onChange={e => update("goal", e.target.value)} style={inputStyle}>
                {["Stay healthy","Lose weight","Build muscle","Reduce stress","Improve energy"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Daily screen hours</label>
              <select value={form.hours} onChange={e => update("hours", e.target.value)} style={inputStyle}>
                {["4-6","6-8","8-10","10+"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={save} disabled={status === "saving"} style={{ display: "flex", alignItems: "center", gap: "7px", background: btn.bg, color: btn.fg, border: "none", borderRadius: "9px", padding: "10px 20px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}>
          <Save size={15} /> {btn.label}
        </button>
      </div>
    </div>
  );
}
