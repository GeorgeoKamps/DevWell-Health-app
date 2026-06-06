import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { LayoutDashboard, Salad, Dumbbell, Timer, MessageCircle, BarChart2, History, User, HeartPulse, Moon, Sun } from "lucide-react";

const navItems = [
  { label: "Dashboard",      path: "/dashboard",    icon: LayoutDashboard },
  { label: "Meal Planner",   path: "/meal-planner", icon: Salad },
  { label: "Workouts",       path: "/workout",      icon: Dumbbell },
  { label: "Activity Timer", path: "/timer",        icon: Timer },
  { label: "Health Chat",    path: "/chat",         icon: MessageCircle },
];
const trackingItems = [
  { label: "Weekly Report", path: "/report", icon: BarChart2 },
  { label: "Activity Log",  path: "/log",    icon: History },
];
const settingItems = [
  { label: "Profile", path: "/profile", icon: User },
];

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "8px 10px", borderRadius: "8px",
        fontSize: "13.5px", textDecoration: "none",
        transition: "all 0.15s",
        background: isActive ? "var(--sidebar-active)" : "transparent",
        color: isActive ? "var(--sidebar-active-text)" : "var(--text2)",
        fontWeight: isActive ? "500" : "400",
      })}
    >
      <Icon size={16} />
      {item.label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <aside style={{
      width: "220px", minWidth: "220px", height: "100vh",
      background: "var(--sidebar)", borderRight: "0.5px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "20px 12px",
      gap: "2px", transition: "background 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px 16px", borderBottom: "0.5px solid var(--border)", marginBottom: "8px" }}>
        <div style={{ width: "30px", height: "30px", background: "var(--accent-bg)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
          <HeartPulse size={17} />
        </div>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>DevWell</span>
      </div>

      {navItems.map(item => <NavItem key={item.path} item={item} />)}
      <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--text3)", padding: "12px 10px 4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Tracking</div>
      {trackingItems.map(item => <NavItem key={item.path} item={item} />)}
      <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--text3)", padding: "12px 10px 4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Settings</div>
      {settingItems.map(item => <NavItem key={item.path} item={item} />)}

      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text2)" }}>
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
            {isDark ? "Dark mode" : "Light mode"}
          </span>
          <div onClick={toggleTheme} style={{ width: "36px", height: "20px", borderRadius: "10px", position: "relative", cursor: "pointer", background: isDark ? "var(--accent)" : "var(--surface2)", border: "0.5px solid var(--border)", transition: "background 0.2s" }}>
            <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", left: isDark ? "19px" : "3px", transition: "left 0.2s" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
