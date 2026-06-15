import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import AuthShell from "../components/AuthShell";
import { field, primaryBtn } from "../components/authStyles";

const DIETS = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Keto", "High protein"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [favInput, setFavInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setProfile({ name: "", diet: "No restrictions", goal: "Stay healthy", favorite_foods: [] }));
  }, []);

  if (!profile) {
    return <AuthShell title="Setting things up…" subtitle="One moment"><div /></AuthShell>;
  }

  const addFav = () => {
    const v = favInput.trim();
    if (v && !(profile.favorite_foods || []).includes(v)) {
      setProfile((p) => ({ ...p, favorite_foods: [...(p.favorite_foods || []), v] }));
    }
    setFavInput("");
  };
  const removeFav = (f) => setProfile((p) => ({ ...p, favorite_foods: p.favorite_foods.filter((x) => x !== f) }));

  const finish = async () => {
    setBusy(true);
    try { await api.saveProfile(profile); } catch { /* keep going */ }
    navigate("/dashboard");
  };

  return (
    <AuthShell title="Tell us about you" subtitle="This helps Byte tailor your plans. You can change it anytime.">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={lbl}>Your name</label>
          <input style={field} value={profile.name || ""} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
        </div>

        <div>
          <label style={lbl}>Diet</label>
          <select style={field} value={profile.diet} onChange={(e) => setProfile((p) => ({ ...p, diet: e.target.value }))}>
            {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Favorite foods <span style={{ color: "var(--text3)", fontWeight: 400 }}>(your meal plans will lean toward these)</span></label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              style={field}
              value={favInput}
              onChange={(e) => setFavInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFav(); } }}
              placeholder="e.g. salmon, oats, avocado"
            />
            <button type="button" onClick={addFav} style={{ flexShrink: 0, padding: "0 14px", borderRadius: "10px", border: "0.5px solid var(--border)", background: "var(--surface2)", color: "var(--text2)", cursor: "pointer" }}>
              <Plus size={16} />
            </button>
          </div>
          {profile.favorite_foods?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {profile.favorite_foods.map((f) => (
                <span key={f} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", padding: "4px 8px 4px 10px", borderRadius: "14px", background: "var(--accent-bg)", color: "var(--accent-text)" }}>
                  {f}
                  <X size={13} style={{ cursor: "pointer" }} onClick={() => removeFav(f)} />
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={finish} disabled={busy} style={primaryBtn(busy)}>
          {busy ? "Saving…" : "Go to my dashboard"} <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: "13px", cursor: "pointer" }}>
          Skip for now
        </button>
      </div>
    </AuthShell>
  );
}

const lbl = { display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--text2)", marginBottom: "6px" };
