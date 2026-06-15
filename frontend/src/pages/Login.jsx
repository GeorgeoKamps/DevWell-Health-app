import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { field, primaryBtn, errorBox } from "../components/authStyles";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message === "401 Unauthorized" ? "Incorrect email or password." : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your DevWell account">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {error && <div style={errorBox}>{error}</div>}
        <input style={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={busy} style={primaryBtn(busy)}>
          <LogIn size={16} /> {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p style={{ fontSize: "13px", color: "var(--text3)", textAlign: "center", marginTop: "16px" }}>
        No account? <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 500 }}>Sign up</Link>
      </p>
    </AuthShell>
  );
}
