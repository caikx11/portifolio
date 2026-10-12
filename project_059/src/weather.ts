export type Cond = "sol" | "nublado" | "chuva" | "tempestade" | "neve" | "neblina";
export interface Day { date: string; cond: Cond; min: number; max: number; rain: number }
export interface Hour { h: number; temp: number }
export interface Forecast { city: string; temp: number; cond: Cond; feels: number; humidity: number; wind: number; uv: number; hours: Hour[]; days: Day[] }

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const normalize = (c: string) => c.trim().replace(/\s+/g, " ");
export const key = (c: string) => normalize(c).toLowerCase();
export const toF = (c: number) => Math.round((c * 9) / 5 + 32);
export function isoDay(d: Date, offset = 0): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
function condFrom(r: number, tempMax: number): Cond {
  if (tempMax <= 1 && r > 0.55) return "neve";
  if (r < 0.34) return "sol";
  if (r < 0.58) return "nublado";
  if (r < 0.78) return "chuva";
  if (r < 0.88) return "neblina";
  return "tempestade";
}

/** Deterministic: same city + same date => same forecast. */
export function forecast(cityRaw: string, now: Date): Forecast {
  const city = normalize(cityRaw);
  const base = hash(key(city));
  const r0 = rng(base);
  const climate = -4 + r0() * 38; // mean annual temp-ish
  const amp = 3 + r0() * 6;
  const days: Day[] = [];
  for (let i = 0; i < 7; i++) {
    const date = isoDay(now, i);
    const r = rng(hash(key(city) + "|" + date));
    const mid = climate + (r() - 0.5) * 2 * amp;
    const range = 4 + r() * 6;
    const max = Math.round(mid + range / 2), min = Math.round(mid - range / 2);
    const cond = condFrom(r(), max);
    const rain = cond === "chuva" || cond === "tempestade" || cond === "neve" ? Math.round(55 + r() * 40) : Math.round(r() * 30);
    days.push({ date, cond, min, max, rain });
  }
  const today = days[0];
  const hours: Hour[] = [];
  const rh = rng(hash(key(city) + "|h|" + today.date));
  for (let h = 0; h < 24; h++) {
    const wave = Math.cos(((h - 15) / 24) * 2 * Math.PI); // peak 15h
    hours.push({ h, temp: Math.round(((today.max + today.min) / 2 + (wave * (today.max - today.min)) / 2 + (rh() - 0.5)) * 10) / 10 });
  }
  const hh = now.getHours();
  const temp = Math.round(hours[hh].temp);
  const wet = today.cond === "chuva" || today.cond === "tempestade";
  return {
    city, temp, cond: today.cond,
    feels: temp + Math.round((rh() - 0.5) * 4 - (today.cond === "sol" ? -1 : 1)),
    humidity: Math.round(Math.min(98, 35 + rh() * 35 + (wet ? 25 : 0))),
    wind: Math.round(4 + rh() * 26 + (today.cond === "tempestade" ? 20 : 0)),
    uv: today.cond === "sol" ? Math.round(5 + rh() * 6) : Math.round(1 + rh() * 4),
    hours, days,
  };
}
