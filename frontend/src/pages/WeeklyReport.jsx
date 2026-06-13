import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Award, WifiOff, FileDown } from "lucide-react";
import { api } from "../api/client";

const card = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow)" };

const toneColor = { accent: "var(--accent)", amber: "var(--amber)", blue: "var(--blue-text)" };

const SAMPLE = {
  week_of: "This week",
  score: 74,
  cards: [
    { label: "Workouts done", value: "4 / 5", tone: "accent" },
    { label: "Avg hydration", value: "1.96L", tone: "blue" },
    { label: "Avg sitting", value: "5.6h", tone: "amber" },
    { label: "Meals logged", value: "18 / 21", tone: "accent" },
  ],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  workouts: [1, 1, 0, 1, 0, 1, 0],
  water: [2.1, 1.8, 2.5, 1.4, 2.2, 2.0, 1.7],
  sitting: [6.2, 7.1, 5.8, 8.0, 6.5, 3.2, 2.1],
  insights: [
    { label: "Workout consistency", value: "80%", note: "4 of 5 sessions", good: true },
    { label: "Hydration goal", value: "78%", note: "Avg 1.96L / 2.5L goal", good: false },
    { label: "Sitting breaks", value: "62%", note: "Missed 38% of alerts", good: false },
    { label: "Meal logging", value: "86%", note: "18 of 21 meals logged", good: true },
  ],
  tip: "You're nailing workouts — great job! Focus next on hydration and sitting breaks. 🐸",
};

function Bar({ value, max, color }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "28px", height: "80px", background: "var(--surface2)", borderRadius: "6px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ width: "100%", height: `${(value / max) * 100}%`, background: color, borderRadius: "6px", transition: "height 0.6s ease" }} />
      </div>
    </div>
  );
}

function StatRow({ label, value, note, good }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
      <span style={{ fontSize: "13.5px", color: "var(--text)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13.5px", fontWeight: "500", color: good ? "var(--accent)" : "var(--amber)" }}>{value}</span>
        <span style={{ fontSize: "11.5px", color: "var(--text3)" }}>{note}</span>
      </div>
    </div>
  );
}

export default function WeeklyReport() {
  const [report, setReport] = useState(SAMPLE);
  const [offline, setOffline] = useState(false);
  const [downloading, setDownloading] = useState(null);

  // Download a doctor-friendly PDF over the chosen period (real log data).
  const downloadReport = async (period) => {
    setDownloading(period);
    try {
      await api.exportProgress(period, "pdf");
    } catch {
      /* backend unreachable */
    } finally {
      setDownloading(null);
    }
  };

  const loadReport = useCallback(async () => {
    try {
      const data = await api.weeklyReport();
      setReport(data);
      setOffline(false);
    } catch {
      setReport(SAMPLE);
      setOffline(true);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadReport(); }, [loadReport]);

  const charts = [
    { title: "Workouts", data: report.workouts, max: 1, color: "var(--accent)" },
    { title: "Water (L)", data: report.water, max: 2.5, color: "var(--blue-text)" },
    { title: "Sitting (h)", data: report.sitting, max: 10, color: "var(--amber)" },
  ];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>Weekly Report 📊</h1>
          <p style={{ fontSize: "13px", color: "var(--text3)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            {offline ? <><WifiOff size={12} /> Backend offline — sample data</> : report.week_of}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent-bg)", color: "var(--accent-text)", fontSize: "13px", fontWeight: "500", padding: "6px 14px", borderRadius: "20px" }}>
          <Award size={14} /> Score: {report.score} / 100
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "12px 16px", boxShadow: "var(--shadow)" }}>
        <span style={{ fontSize: "13px", color: "var(--text2)", display: "flex", alignItems: "center", gap: "7px" }}>
          <FileDown size={15} color="var(--accent)" /> Progress report for your doctor
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={() => downloadReport("weekly")} disabled={!!downloading} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: downloading ? "default" : "pointer", opacity: downloading ? 0.6 : 1 }}>
          <FileDown size={14} /> {downloading === "weekly" ? "Preparing…" : "Last 7 days (PDF)"}
        </button>
        <button onClick={() => downloadReport("monthly")} disabled={!!downloading} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface2)", color: "var(--text2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", cursor: downloading ? "default" : "pointer", opacity: downloading ? 0.6 : 1 }}>
          <FileDown size={14} /> {downloading === "monthly" ? "Preparing…" : "Last 30 days (PDF)"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {report.cards.map(({ label, value, tone }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: toneColor[tone] || "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        {charts.map(({ title, data, max, color }) => (
          <div key={title} style={card}>
            <h3 style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", marginBottom: "12px" }}>{title}</h3>
            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
              {data.map((v, i) => <Bar key={i} value={v} max={max} color={color} />)}
            </div>
            <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
              {report.days.map(d => <div key={d} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: "var(--text3)" }}>{d}</div>)}
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
          <TrendingUp size={15} color="var(--accent)" />
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>Byte's insights</h3>
        </div>
        {report.insights.map((ins) => <StatRow key={ins.label} {...ins} />)}
        <div style={{ marginTop: "14px", background: "var(--accent-bg)", borderRadius: "10px", padding: "12px 14px" }}>
          <p style={{ fontSize: "13.5px", color: "var(--accent-text)", lineHeight: "1.6" }}>
            💡 <strong>Next week focus:</strong> {report.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
