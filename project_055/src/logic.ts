import { BANK, Question } from './bank';
export const SECONDS = 20;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** monta o quiz embaralhando perguntas e alternativas (answer acompanha a alternativa correta) */
export function buildQuiz(topic: string, count: number, rnd: () => number = Math.random, bank: Question[] = BANK): Question[] {
  const pool = bank.filter(q => topic === 'all' || q.topic === topic);
  return shuffle(pool, rnd).slice(0, Math.max(1, count)).map(q => {
    const order = shuffle(q.options.map((_, i) => i), rnd);
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  });
}
export interface Answer { qid: number; picked: number | null; correct: boolean }
export function points(correct: boolean, secondsLeft: number, streak: number): number {
  if (!correct) return 0;
  return 100 + Math.max(0, Math.min(SECONDS, secondsLeft)) * 2 + Math.min(streak, 5) * 10;
}
export function grade(correct: number, total: number): { pct: number; label: string } {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return { pct, label: pct >= 90 ? 'Sênior' : pct >= 70 ? 'Pleno' : pct >= 40 ? 'Júnior' : 'Estagiário' };
}
export type Best = Record<string, { score: number; pct: number }>;
export function updateBest(best: Best, key: string, score: number, pct: number): { best: Best; isNew: boolean } {
  const prev = best[key];
  if (prev && prev.score >= score) return { best, isNew: false };
  return { best: { ...best, [key]: { score, pct } }, isNew: true };
}
export function loadBest(raw: string | null): Best {
  try { const v = JSON.parse(raw ?? 'null'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; }
}
