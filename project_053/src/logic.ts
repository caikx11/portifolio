export interface Habit { id: string; name: string; emoji: string; target: number; checks: string[]; createdAt: string }
export type Stage = 0 | 1 | 2 | 3 | 4;
export const STAGE_NAMES = ['Semente', 'Broto', 'Muda', 'Arbusto', 'Em flor'];

export const dateKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}
export function validateName(name: string, habits: Habit[]): string | null {
  const v = name.trim();
  if (!v) return 'Dê um nome ao hábito.';
  if (v.length > 40) return 'Use até 40 caracteres.';
  if (habits.some(h => h.name.toLowerCase() === v.toLowerCase())) return 'Você já tem um hábito com esse nome.';
  return null;
}
export function createHabit(name: string, emoji: string, target: number, today: string): Habit {
  return { id: `h${Date.now()}${Math.floor(Math.random() * 1e4)}`, name: name.trim(), emoji, target: Math.min(7, Math.max(1, target)), checks: [], createdAt: today };
}
export function toggleCheck(h: Habit, day: string): Habit {
  const has = h.checks.includes(day);
  return { ...h, checks: has ? h.checks.filter(d => d !== day) : [...h.checks, day].sort() };
}
/** sequência de dias consecutivos terminando hoje (ou ontem, se hoje ainda não foi marcado) */
export function streak(h: Habit, today: string): number {
  const set = new Set(h.checks);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) { n++; day = addDays(day, -1); }
  return n;
}
export function weekDays(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
}
export function stage(h: Habit, today: string): Stage {
  const score = Math.max(streak(h, today), Math.floor(h.checks.length / 2));
  return score >= 21 ? 4 : score >= 10 ? 3 : score >= 4 ? 2 : h.checks.length >= 1 ? 1 : 0;
}
export function weekDone(h: Habit, today: string): number {
  return weekDays(today).filter(d => h.checks.includes(d)).length;
}
export function loadHabits(raw: string | null): Habit[] {
  try {
    const v = JSON.parse(raw ?? 'null');
    return Array.isArray(v) ? v.filter(h => h && typeof h.id === 'string' && typeof h.name === 'string' && Array.isArray(h.checks)) : [];
  } catch { return []; }
}
