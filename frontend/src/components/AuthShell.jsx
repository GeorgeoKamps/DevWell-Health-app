// Shared centered card layout for the auth pages.
// (Form styles live in ./authStyles.js so this file only exports a component.)

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div style={{ fontSize: "40px", marginBottom: "6px" }}>🐸</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)" }}>DevWell</h1>
        </div>
        <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-md)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "20px" }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
