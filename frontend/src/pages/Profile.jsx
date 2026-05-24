import { useState } from "react";
import { User, Save } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow)" };

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "0.5px solid var(--border)", background: "var(--surface2)",
  color: "var(--text)", fontSize: "13.5px", outline: "none",
};

const labelStyle = { fontSize: "12px", color: "var(--text3)", marginBottom: "5px", display: "block" };

export default function Profile() {
  const [form, setForm] = useState({
    name: "George", age: "27", weight: "78", height: "180",
    diet: "No restrictions", level: "Intermediate", goal: "Stay healthy", hours: "8-10",
  });
  const [saved, setSaved] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Profile ⚙️</h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Your preferences power the AI recommendations</p>
      </div>

      {/* Avatar */}
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
        {/* Personal */}
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

        {/* Health prefs */}
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
        <button onClick={save} style={{ display: "flex", alignItems: "center", gap: "7px", background: saved ? "var(--accent-bg)" : "var(--accent)", color: saved ? "var(--accent-text)" : "white", border: "none", borderRadius: "9px", padding: "10px 20px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}>
          <Save size={15} /> {saved ? "Saved! ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
