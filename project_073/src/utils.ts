export const chunk = <T>(arr: readonly T[], size: number): T[][] => {
  if (!Number.isInteger(size) || size < 1) throw new RangeError("size deve ser um inteiro >= 1");
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
export const unique = <T>(arr: readonly T[]): T[] => [...new Set(arr)];
export const groupBy = <T, K extends string | number>(arr: readonly T[], key: (x: T) => K): Record<K, T[]> => {
  const out = {} as Record<K, T[]>;
  for (const x of arr) (out[key(x)] ||= []).push(x);
  return out;
};
export const sortBy = <T>(arr: readonly T[], key: (x: T) => string | number, dir: "asc" | "desc" = "asc"): T[] =>
  [...arr].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * (dir === "desc" ? -1 : 1));
export const range = (start: number, end: number, step = 1): number[] => {
  if (step === 0) throw new RangeError("step não pode ser 0");
  const out: number[] = [];
  for (let n = start; step > 0 ? n < end : n > end; n += step) out.push(n);
  return out;
};
export const clamp = (n: number, min: number, max: number): number => {
  if (min > max) throw new RangeError("min > max");
  return Math.min(max, Math.max(min, n));
};
export const sum = (arr: readonly number[]): number => arr.reduce((a, b) => a + b, 0);
export const average = (arr: readonly number[]): number => (arr.length ? sum(arr) / arr.length : NaN);
export const pick = <T extends object, K extends keyof T>(o: T, keys: readonly K[]): Pick<T, K> => {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (k in o) out[k] = o[k];
  return out;
};
export const omit = <T extends object, K extends keyof T>(o: T, keys: readonly K[]): Omit<T, K> => {
  const out = { ...o } as T;
  for (const k of keys) delete out[k];
  return out;
};
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => deepEqual((a as any)[k], (b as any)[k]));
};
export const slugify = (s: string): string =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const words = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.toLowerCase());
export const camelCase = (s: string): string => words(s).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join("");
export const snakeCase = (s: string): string => words(s).join("_");
export const kebabCase = (s: string): string => words(s).join("-");
export const capitalize = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s);
export const truncate = (s: string, max: number, ellipsis = "…"): string =>
  s.length <= max ? s : s.slice(0, Math.max(0, max - ellipsis.length)) + ellipsis;
export const formatBytes = (n: number, decimals = 1): string => {
  if (!Number.isFinite(n) || n < 0) throw new RangeError("n deve ser um número >= 0");
  if (n < 1024) return `${n} B`;
  const u = ["KB", "MB", "GB", "TB"]; let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return `${n.toFixed(decimals)} ${u[i]}`;
};
export const parseQuery = (qs: string): Record<string, string | string[]> => {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of new URLSearchParams(qs.replace(/^\?/, ""))) {
    const cur = out[k];
    out[k] = cur === undefined ? v : Array.isArray(cur) ? [...cur, v] : [cur, v];
  }
  return out;
};
export const isPalindrome = (s: string): boolean => { const t = slugify(s).replace(/-/g, ""); return t.length > 0 && t === [...t].reverse().join(""); };
export const debounce = <A extends unknown[]>(fn: (...a: A) => void, ms: number) => {
  let t: ReturnType<typeof setTimeout> | undefined;
  const d = (...a: A) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
};
export const memoize = <A extends unknown[], R>(fn: (...a: A) => R) => {
  const cache = new Map<string, R>();
  return (...a: A): R => { const k = JSON.stringify(a); if (!cache.has(k)) cache.set(k, fn(...a)); return cache.get(k) as R; };
};
