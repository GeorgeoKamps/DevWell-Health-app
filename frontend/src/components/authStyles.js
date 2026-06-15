// Shared form styles for the auth pages (kept out of the component file so
// fast-refresh stays happy).

export const field = {
  width: "100%", padding: "11px 13px", borderRadius: "10px",
  border: "0.5px solid var(--border)", background: "var(--surface2)",
  color: "var(--text)", fontSize: "14px", boxSizing: "border-box",
};

export const primaryBtn = (busy) => ({
  width: "100%", padding: "12px", borderRadius: "10px", border: "none",
  background: "var(--accent)", color: "#fff", fontSize: "14px", fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, marginTop: "4px",
});

export const errorBox = {
  background: "var(--coral-bg)", color: "var(--coral-text)", fontSize: "13px",
  padding: "10px 12px", borderRadius: "8px", textAlign: "center",
};
