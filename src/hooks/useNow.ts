import { useEffect, useState } from "react";

/**
 * Returns a periodically-updating timestamp while `active` is true, so
 * components can render a live elapsed timer without owning their own loop.
 */
export function useNow(active: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

/** Format a millisecond duration as a compact human string (e.g. "1m 23s", "8.4s"). */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = ms / 1000;
  if (totalSeconds < 10) return `${totalSeconds.toFixed(1)}s`;
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
