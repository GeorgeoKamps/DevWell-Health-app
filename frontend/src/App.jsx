import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Byte from "./components/Byte";
import NudgeOverlay from "./components/NudgeOverlay";
import { useNudgeStream } from "./hooks/useNudgeStream";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import MealPlanner from "./pages/MealPlanner";
import Workout from "./pages/Workout";
import ActivityTimer from "./pages/ActivityTimer";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import Library from "./pages/Library";
import WeeklyReport from "./pages/WeeklyReport";
import ActivityLog from "./pages/ActivityLog";
import Profile from "./pages/Profile";
import "./index.css";

function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text3)" }}>
      Loading…
    </div>
  );
}

function AppShell() {
  const { nudge, ackBreak } = useNudgeStream();
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", transition: "background 0.2s", position: "relative" }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/timer" element={<ActivityTimer />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/library" element={<Library />} />
          <Route path="/report" element={<WeeklyReport />} />
          <Route path="/log" element={<ActivityLog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Byte />
      </main>

      {/* App-wide nudge pushed by the backend sitting-alert agent over SSE */}
      <NudgeOverlay
        open={!!nudge}
        nudge={nudge?.message}
        brk={nudge?.micro_break}
        onTakeBreak={ackBreak}
        onSnooze={ackBreak}
        onClose={ackBreak}
      />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
