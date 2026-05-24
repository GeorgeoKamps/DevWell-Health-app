import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Byte from "./components/Byte";
import Dashboard from "./pages/Dashboard";
import MealPlanner from "./pages/MealPlanner";
import Workout from "./pages/Workout";
import Chat from "./pages/Chat";
import WeeklyReport from "./pages/WeeklyReport";
import ActivityLog from "./pages/ActivityLog";
import Profile from "./pages/Profile";
import "./index.css";

function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", transition: "background 0.2s", position: "relative" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/report" element={<WeeklyReport />} />
          <Route path="/log" element={<ActivityLog />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Byte />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
