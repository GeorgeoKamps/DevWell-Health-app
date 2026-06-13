import { useEffect, useState, useCallback, useRef } from "react";
import { api, API_URL } from "../api/client";

const HEARTBEAT_MS = 30000;
// Set to a number of seconds to force quick nudges while testing (e.g. 20).
// Leave null to use the user's persisted break interval from their profile.
const INTERVAL_OVERRIDE = null;

/**
 * Subscribes to the backend sitting-alert agent over SSE and sends heartbeats
 * so the agent knows the tab is active. Returns the current server nudge (or
 * null) plus ackBreak() to dismiss it and reset the agent's cycle.
 */
export function useNudgeStream() {
  const [nudge, setNudge] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    const beat = () => api.heartbeat(INTERVAL_OVERRIDE).catch(() => {});
    beat();
    const hb = setInterval(beat, HEARTBEAT_MS);

    const qs = INTERVAL_OVERRIDE ? `?interval=${INTERVAL_OVERRIDE}` : "";
    const es = new EventSource(`${API_URL}/nudge/stream${qs}`);
    esRef.current = es;
    es.addEventListener("nudge", (e) => {
      try { setNudge(JSON.parse(e.data)); } catch { /* ignore malformed */ }
    });
    es.onerror = () => { /* EventSource auto-reconnects */ };

    return () => { clearInterval(hb); es.close(); };
  }, []);

  const ackBreak = useCallback(() => {
    setNudge(null);
    api.tookBreak().catch(() => {});
  }, []);

  return { nudge, ackBreak };
}
