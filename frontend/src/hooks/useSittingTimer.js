import { useState, useEffect, useCallback } from "react";

/**
 * Tracks continuous sitting time and counts down to the next break.
 *
 * @param {number} intervalSeconds  How long between breaks (default 45 min, per spec).
 * @param {boolean} autoStart       Start ticking immediately (default true).
 */
export function useSittingTimer(intervalSeconds = 45 * 60, autoStart = true) {
  const [elapsed, setElapsed] = useState(0);
  const [breakDue, setBreakDue] = useState(false);
  const [running, setRunning] = useState(autoStart);
  const [breaksTaken, setBreaksTaken] = useState(0);

  useEffect(() => {
    if (!running || breakDue) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= intervalSeconds) {
          setBreakDue(true);
          return intervalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, breakDue, intervalSeconds]);

  const remaining = Math.max(0, intervalSeconds - elapsed);

  const takeBreak = useCallback(() => {
    setBreaksTaken((n) => n + 1);
    setElapsed(0);
    setBreakDue(false);
    setRunning(true);
  }, []);

  const snooze = useCallback((sec = 5 * 60) => {
    setBreakDue(false);
    setElapsed(Math.max(0, intervalSeconds - sec));
    setRunning(true);
  }, [intervalSeconds]);

  const triggerNow = useCallback(() => {
    setElapsed(intervalSeconds);
    setBreakDue(true);
  }, [intervalSeconds]);

  const reset = useCallback(() => {
    setElapsed(0);
    setBreakDue(false);
  }, []);

  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const formattedElapsed = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return {
    elapsed,
    remaining,
    breakDue,
    running,
    breaksTaken,
    progress: intervalSeconds > 0 ? elapsed / intervalSeconds : 0,
    formattedRemaining: `${mm}:${ss}`,
    formattedElapsed,
    takeBreak,
    snooze,
    triggerNow,
    reset,
    pause,
    resume,
  };
}
