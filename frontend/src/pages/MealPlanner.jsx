import { useState, useEffect, useCallback } from "react";
import { Salad, ShoppingCart, ChevronDown, ChevronUp, Clock, Flame, Check, RefreshCw, WifiOff, FileText } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const prettySource = (s) => s.split("/").pop().replace(/\.md$/, "").replace(/_/g, " ");

// Fallback data shown if the backend isn't reachable.
const SAMPLE_DAYS = [
  { day: "Monday",    breakfast: "Oats + berries",         lunch: "Tuna salad wrap",              dinner: "Grilled salmon + quinoa", kcal: 1820 },
  { day: "Tuesday",   breakfast: "Greek yogurt + granola", lunch: "Chicken grain bowl",           dinner: "Stir-fry veggies + tofu", kcal: 1760 },
  { day: "Wednesday", breakfast: "Avocado toast + egg",    lunch: "Lentil soup + bread",          dinner: "Turkey meatballs + pasta", kcal: 1900 },
  { day: "Thursday",  breakfast: "Smoothie bowl",          lunch: "Caesar salad + chicken",       dinner: "Baked cod + sweet potato", kcal: 1680 },
  { day: "Friday",    breakfast: "Overnight oats",         lunch: "Hummus wrap + veggies",        dinner: "Beef stir-fry + rice",    kcal: 1950 },
  { day: "Saturday",  breakfast: "Pancakes + fruit",       lunch: "Tomato soup + grilled cheese", dinner: "Homemade pizza",          kcal: 2100 },
  { day: "Sunday",    breakfast: "Eggs + toast + OJ",      lunch: "Leftovers",                    dinner: "Roast chicken + veggies", kcal: 1850 },
];
const SAMPLE_SHOPPING = ["Chicken breast (500g)", "Salmon fillets (400g)", "Greek yogurt (1kg)", "Quinoa (500g)", "Mixed greens (3 bags)", "Avocados (4)", "Eggs (12)", "Sweet potatoes (4)", "Lentils (400g)", "Oats (1kg)", "Berries (frozen, 500g)", "Olive oil", "Lemons (4)", "Garlic (1 bulb)", "Cherry tomatoes (500g)"];

export default function MealPlanner() {
  const [days, setDays] = useState(SAMPLE_DAYS);
  const [shopping, setShopping] = useState(SAMPLE_SHOPPING);
  const [sources, setSources] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showList, setShowList] = useState(false);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchPlan = useCallback(async () => {
    try {
      const data = await api.getMealPlan({ diet: "balanced", max_cook_time_min: 30, days: 7 });
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
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const regenerate = () => { setLoading(true); fetchPlan(); };

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
            {loading ? "Loading your plan…" : offline ? <><WifiOff size={12} /> Backend offline — showing sample data</> : "Weekly plan from your DevWell API"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={regenerate} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface)", color: "var(--text2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={14} style={{ animation: loading ? "mpSpin 0.8s linear infinite" : "none" }} /> Regenerate
          </button>
          <button onClick={() => setShowList((s) => !s)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            <ShoppingCart size={14} /> Shopping list
          </button>
        </div>
      </div>

      {sources.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "-8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={11} /> Grounded in:</span>
          {sources.map((s, i) => (
            <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--surface2)", color: "var(--text2)", border: "0.5px solid var(--border)" }}>{prettySource(s)}</span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Shopping list */}
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
                <span style={{
                  width: "16px", height: "16px", borderRadius: "5px", flexShrink: 0,
                  border: checked[i] ? "none" : "1.5px solid var(--border)",
                  background: checked[i] ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked[i] && <Check size={11} color="#fff" />}
                </span>
                <span style={{ textDecoration: checked[i] ? "line-through" : "none" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week grid */}
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
