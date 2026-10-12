export type Mode = "focus" | "short" | "long";
export interface Settings { focus: number; short: number; long: number; longEvery: number }
export const DEFAULTS: Settings = { focus: 25, short: 5, long: 15, longEvery: 4 };

export function clampMinutes(v: number, min = 1, max = 120): number {
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, Math.round(v)));
}
export function sanitize(s: Partial<Settings> | null | undefined): Settings {
  const d = DEFAULTS;
  return {
    focus: clampMinutes(s?.focus ?? d.focus), short: clampMinutes(s?.short ?? d.short),
    long: clampMinutes(s?.long ?? d.long), longEvery: clampMinutes(s?.longEvery ?? d.longEvery, 2, 10),
  };
}
export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
export function durationOf(mode: Mode, s: Settings): number {
  return s[mode] * 60;
}
/** Next mode after finishing `mode`; completedFocus counts focus sessions including the one just finished. */
export function nextMode(mode: Mode, completedFocus: number, longEvery: number): Mode {
  if (mode !== "focus") return "focus";
  return completedFocus > 0 && completedFocus % longEvery === 0 ? "long" : "short";
}
export function remainingSec(endAt: number, now: number): number {
  return Math.max(0, (endAt - now) / 1000);
}
export function progress(remaining: number, total: number): number {
  return total <= 0 ? 0 : Math.min(1, Math.max(0, 1 - remaining / total));
}
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addFocus(history: Record<string, number>, key: string, minutes: number): Record<string, number> {
  return { ...history, [key]: (history[key] || 0) + minutes };
}
export function lastDays(history: Record<string, number>, n: number, today: Date): { key: string; minutes: number }[] {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = dayKey(d);
    out.push({ key, minutes: history[key] || 0 });
  }
  return out;
}
