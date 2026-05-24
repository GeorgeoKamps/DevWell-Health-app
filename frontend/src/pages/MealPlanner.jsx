import { useState } from "react";
import { Salad, ShoppingCart, ChevronDown, ChevronUp, Clock, Flame } from "lucide-react";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const weekMeals = [
  { day: "Monday",    breakfast: "Oats + berries",           lunch: "Tuna salad wrap",           dinner: "Grilled salmon + quinoa" },
  { day: "Tuesday",   breakfast: "Greek yogurt + granola",   lunch: "Chicken grain bowl",         dinner: "Stir-fry veggies + tofu" },
  { day: "Wednesday", breakfast: "Avocado toast + egg",      lunch: "Lentil soup + bread",        dinner: "Turkey meatballs + pasta" },
  { day: "Thursday",  breakfast: "Smoothie bowl",            lunch: "Caesar salad + chicken",     dinner: "Baked cod + sweet potato" },
  { day: "Friday",    breakfast: "Overnight oats",           lunch: "Hummus wrap + veggies",      dinner: "Beef stir-fry + rice" },
  { day: "Saturday",  breakfast: "Pancakes + fruit",         lunch: "Tomato soup + grilled cheese", dinner: "Homemade pizza" },
  { day: "Sunday",    breakfast: "Eggs + toast + OJ",        lunch: "Leftovers",                  dinner: "Roast chicken + veggies" },
];

const shopping = ["Chicken breast (500g)", "Salmon fillets (400g)", "Greek yogurt (1kg)", "Quinoa (500g)", "Mixed greens (3 bags)", "Avocados (4)", "Eggs (12)", "Sweet potatoes (4)", "Lentils (400g)", "Oats (1kg)", "Berries (frozen, 500g)", "Olive oil", "Lemons (4)", "Garlic (1 bulb)", "Cherry tomatoes (500g)"];

export default function MealPlanner() {
  const [expanded, setExpanded] = useState(null);
  const [showList, setShowList] = useState(false);
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Meal Planner 🥗</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px" }}>Your AI-generated weekly plan</p>
        </div>
        <button onClick={() => setShowList(s => !s)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
          <ShoppingCart size={14} /> Shopping list
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {[{ icon: Flame, label: "Avg daily kcal", value: "1,850 kcal" }, { icon: Clock, label: "Avg cook time", value: "22 min" }, { icon: Salad, label: "Veg servings/day", value: "5 portions" }].map(({ icon: Icon, label, value }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Icon size={13} />{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Shopping list */}
      {showList && (
        <div style={card}>
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}><ShoppingCart size={15} color="var(--accent)" /> Weekly shopping list</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {shopping.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--text2)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {weekMeals.map((day, i) => (
          <div key={i} style={card}>
            <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontWeight: "500", fontSize: "14px", color: "var(--text)" }}>{day.day}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>{day.breakfast} · {day.lunch} · {day.dinner}</span>
                {expanded === i ? <ChevronUp size={15} color="var(--text3)" /> : <ChevronDown size={15} color="var(--text3)" />}
              </div>
            </div>
            {expanded === i && (
              <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[["🌅 Breakfast", day.breakfast], ["☀️ Lunch", day.lunch], ["🌙 Dinner", day.dinner]].map(([label, meal]) => (
                  <div key={label} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "var(--text)", fontWeight: "500" }}>{meal}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
