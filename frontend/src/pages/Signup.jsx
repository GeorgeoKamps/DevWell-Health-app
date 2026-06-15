import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { field, primaryBtn, errorBox } from "../components/authStyles";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      await signup(email.trim(), password, name.trim());
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start your wellness journey">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {error && <div style={errorBox}>{error}</div>}
        <input style={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={busy} style={primaryBtn(busy)}>
          <UserPlus size={16} /> {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p style={{ fontSize: "13px", color: "var(--text3)", textAlign: "center", marginTop: "16px" }}>
        Already have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>Log in</Link>
      </p>
    </AuthShell>
  );
}
