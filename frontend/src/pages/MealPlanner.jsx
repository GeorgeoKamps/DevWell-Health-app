import { useState, useEffect } from "react";
import { Salad, ShoppingCart, ChevronDown, ChevronUp, Clock, Flame, Check, RefreshCw, WifiOff, FileText, Download, Plus, X, Sparkles } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };
const lbl = { display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text2)", marginBottom: "6px" };
const field = { flex: 1, padding: "8px 11px", borderRadius: "8px", border: "0.5px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", outline: "none" };

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");

const DIETS = ["balanced", "high protein", "vegetarian", "vegan", "pescatarian", "keto", "low carb"];

const SAMPLE_DAYS = [
  { day: "Monday",    breakfast: "Oats + berries",         lunch: "Tuna salad wrap",              dinner: "Grilled salmon + quinoa", kcal: 1820 },
  { day: "Tuesday",   breakfast: "Greek yogurt + granola", lunch: "Chicken grain bowl",           dinner: "Stir-fry veggies + tofu", kcal: 1760 },
  { day: "Wednesday", breakfast: "Avocado toast + egg",    lunch: "Lentil soup + bread",          dinner: "Turkey meatballs + pasta", kcal: 1900 },
];
const SAMPLE_SHOPPING = ["Mixed greens (3 bags)", "Oats (1kg)", "Berries (frozen, 500g)", "Olive oil", "Lemons (4)", "Garlic (1 bulb)"];

// Reusable tag input for likes / allergies / dislikes.
function TagInput({ label, hint, placeholder, tags, setTags, tone }) {
  const [val, setVal] = useState("");
  const add = () => { const v = val.trim(); if (v && !tags.includes(v)) setTags([...tags, v]); setVal(""); };
  const tones = {
    accent: { bg: "var(--accent-bg)", text: "var(--accent-text)" },
    coral: { bg: "var(--coral-bg)", text: "var(--coral-text)" },
    amber: { bg: "var(--amber-bg)", text: "var(--amber-text)" },
  };
  const c = tones[tone] || tones.accent;
  return (
    <div>
      <label style={lbl}>{label} {hint && <span style={{ color: "var(--text3)", fontWeight: 400 }}>· {hint}</span>}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <input style={field} value={val} placeholder={placeholder}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} style={{ flexShrink: 0, padding: "0 12px", borderRadius: "8px", border: "0.5px solid var(--border)", background: "var(--surface2)", color: "var(--text2)", cursor: "pointer" }}>
          <Plus size={15} />
        </button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
          {tags.map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "3px 7px 3px 10px", borderRadius: "14px", background: c.bg, color: c.text }}>
              {t} <X size={12} style={{ cursor: "pointer" }} onClick={() => setTags(tags.filter((x) => x !== t))} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MealPlanner() {
  const [days, setDays] = useState(SAMPLE_DAYS);
  const [shopping, setShopping] = useState(SAMPLE_SHOPPING);
  const [sources, setSources] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showList, setShowList] = useState(false);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [exporting, setExporting] = useState(null);

  // Preferences
  const [diet, setDiet] = useState("balanced");
  const [likes, setLikes] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  const runPlan = async (opts) => {
    setLoading(true);
    try {
      const data = await api.getMealPlan(opts);
      setDays(data.days);
      setShopping(data.shopping_list);
      setSources(data.sources || []);
      setOffline(false);
    } catch {
      setDays(SAMPLE_DAYS);
      setShopping(SAMPLE_SHOPPING);
      setSources([]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { runPlan({ diet: "balanced", max_cook_time_min: 30, days: 7 }); }, []);

  const generate = () => runPlan({
    diet, max_cook_time_min: 30, days: 7,
    favorite_foods: likes, allergies, disliked_foods: dislikes,
  });

  const exportPlan = async (format) => {
    setExporting(format);
    try {
      await api.exportMealPlan({ days, shopping_list: shopping, sources }, format);
    } catch {
      /* backend unreachable */
    } finally {
      setExporting(null);
    }
  };

  const gathered = shopping.reduce((n, _, i) => n + (checked[i] ? 1 : 0), 0);
  const avgKcal = days.length ? Math.round(days.reduce((s, d) => s + (d.kcal || 0), 0) / days.length) : 0;
  const toggleItem = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }));

  const stats = [
    { icon: Flame, label: "Avg daily kcal", value: `${avgKcal.toLocaleString()} kcal` },
    { icon: Clock, label: "Avg cook time", value: "22 min" },
    { icon: Salad, label: "Veg servings/day", value: "5 portions" },
  ];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Meal Planner 🥗</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            {loading ? "Building your plan…" : offline ? <><WifiOff size={12} /> Backend offline — showing sample data</> : "Tailored to your taste by your DevWell API"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowList((s) => !s)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            <ShoppingCart size={14} /> Shopping list
          </button>
          <button onClick={() => exportPlan("pdf")} disabled={offline || exporting} title={offline ? "Connect to the backend to export" : "Download as PDF"} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface)", color: "var(--text2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: offline || exporting ? "default" : "pointer", opacity: offline || exporting ? 0.6 : 1 }}>
            <Download size={14} style={{ animation: exporting === "pdf" ? "mpSpin 0.8s linear infinite" : "none" }} /> {exporting === "pdf" ? "Exporting…" : "PDF"}
          </button>
          <button onClick={() => exportPlan("md")} disabled={offline || exporting} title={offline ? "Connect to the backend to export" : "Download as Markdown"} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface)", color: "var(--text2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: offline || exporting ? "default" : "pointer", opacity: offline || exporting ? 0.6 : 1 }}>
            <FileText size={14} /> {exporting === "md" ? "Exporting…" : ".md"}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
          <Sparkles size={15} color="var(--accent)" />
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Your taste — tell Byte what to cook for you</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={lbl}>Diet</label>
            <select style={{ ...field, width: "100%" }} value={diet} onChange={(e) => setDiet(e.target.value)}>
              {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <TagInput label="Foods you like" hint="featured when they fit" placeholder="e.g. salmon, paneer, oats" tags={likes} setTags={setLikes} tone="accent" />
          <TagInput label="Allergies" hint="strictly avoided" placeholder="e.g. peanuts, shellfish" tags={allergies} setTags={setAllergies} tone="coral" />
          <TagInput label="Foods you dislike" hint="left out" placeholder="e.g. tofu, mushrooms" tags={dislikes} setTags={setDislikes} tone="amber" />
        </div>
        <button onClick={generate} disabled={loading} style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "7px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={14} style={{ animation: loading ? "mpSpin 0.8s linear infinite" : "none" }} /> {loading ? "Generating…" : "Generate my meal plan"}
        </button>
      </div>

      {sources.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "-8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={11} /> Grounded in:</span>
          {sources.map((s, i) => (
            <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--surface2)", color: "var(--text2)", border: "0.5px solid var(--border)" }}>{prettySource(s)}</span>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      {showList && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}><ShoppingCart size={15} color="var(--accent)" /> Weekly shopping list</h3>
            <span style={{ fontSize: "12px", color: "var(--text3)" }}>{gathered}/{shopping.length} gathered</span>
          </div>
          <div style={{ height: "5px", background: "var(--surface2)", borderRadius: "3px", overflow: "hidden", marginBottom: "14px" }}>
            <div style={{ width: `${shopping.length ? (gathered / shopping.length) * 100 : 0}%`, height: "100%", background: "var(--accent)", transition: "width 0.25s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {shopping.map((item, i) => (
              <div key={i} onClick={() => toggleItem(i)} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: checked[i] ? "var(--text3)" : "var(--text2)", cursor: "pointer", padding: "3px 0" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "5px", flexShrink: 0, border: checked[i] ? "none" : "1.5px solid var(--border)", background: checked[i] ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {checked[i] && <Check size={11} color="#fff" />}
                </span>
                <span style={{ textDecoration: checked[i] ? "line-through" : "none" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {days.map((day, i) => (
          <div key={i} style={card}>
            <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontWeight: "500", fontSize: "14px", color: "var(--text)" }}>{day.day}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>{day.breakfast} · {day.lunch} · {day.dinner}</span>
                {expanded === i ? <ChevronUp size={15} color="var(--text3)" /> : <ChevronDown size={15} color="var(--text3)" />}
              </div>
            </div>
            {expanded === i && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[["🌅 Breakfast", day.breakfast], ["☀️ Lunch", day.lunch], ["🌙 Dinner", day.dinner]].map(([label, meal]) => (
                    <div key={label} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontSize: "13px", color: "var(--text)", fontWeight: "500" }}>{meal}</div>
                    </div>
                  ))}
                </div>
                {day.kcal ? <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "10px" }}>~{day.kcal.toLocaleString()} kcal for the day</div> : null}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`@keyframes mpSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
