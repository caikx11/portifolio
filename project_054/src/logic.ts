export interface Recipe { id: string; title: string; category: string; minutes: number; servings: number; ingredients: string[]; steps: string[]; fav: boolean }
export const CATEGORIES = ['Massas', 'Sobremesas', 'Saladas', 'Pratos principais', 'Lanches'];

export interface Parsed { qty: number | null; rest: string }
const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };
export function parseIngredient(line: string): Parsed {
  const s = line.trim();
  const m = s.match(/^(\d+)\s+(\d+)\/(\d+)\s+(.*)$/) || s.match(/^(\d+)?\s*([½¼¾⅓⅔])\s*(.*)$/) || s.match(/^(\d+)\/(\d+)\s+(.*)$/) || s.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return { qty: null, rest: s };
  if (/^(\d+)\s+(\d+)\/(\d+)\s+/.test(s)) return { qty: +m[1] + +m[2] / +m[3], rest: m[4] };
  if (/^(\d+)?\s*[½¼¾⅓⅔]/.test(s)) return { qty: (m[1] ? +m[1] : 0) + FRAC[m[2]], rest: m[3] };
  if (/^\d+\/\d+\s+/.test(s)) return { qty: +m[1] / +m[2], rest: m[3] };
  return { qty: parseFloat(m[1].replace(',', '.')), rest: m[2] };
}
export function formatQty(n: number): string {
  const r = Math.round(n * 4) / 4;
  if (r === 0) return n > 0 ? '1/4' : '0';
  const whole = Math.floor(r), f = r - whole;
  const fs = f === 0 ? '' : f === 0.25 ? '1/4' : f === 0.5 ? '1/2' : '3/4';
  if (n >= 10) return String(Math.round(n));
  return [whole || '', fs].filter(Boolean).join(' ');
}
export function scaleIngredient(line: string, factor: number): string {
  const p = parseIngredient(line);
  return p.qty === null ? p.rest : `${formatQty(p.qty * factor)} ${p.rest}`.trim();
}
export function validateRecipe(r: { title: string; ingredients: string; steps: string; minutes: number; servings: number }): string | null {
  if (!r.title.trim()) return 'Informe o título da receita.';
  if (!r.ingredients.trim()) return 'Liste pelo menos um ingrediente (um por linha).';
  if (!r.steps.trim()) return 'Descreva pelo menos um passo do preparo.';
  if (!(r.minutes > 0) || !(r.servings > 0)) return 'Tempo e porções devem ser maiores que zero.';
  return null;
}
export const lines = (t: string): string[] => t.split('\n').map(x => x.trim()).filter(Boolean);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export function filterRecipes(rs: Recipe[], q: string, cat: string, onlyFav: boolean): Recipe[] {
  const n = norm(q.trim());
  return rs.filter(r => (cat === 'Todas' || r.category === cat) && (!onlyFav || r.fav) && (!n || norm(r.title + ' ' + r.ingredients.join(' ')).includes(n)));
}
export interface ShopItem { id: string; text: string; done: boolean }
export function addToShopping(list: ShopItem[], ingredients: string[], factor: number): ShopItem[] {
  const out = [...list];
  for (const ing of ingredients) {
    const text = scaleIngredient(ing, factor);
    if (!out.some(i => norm(i.text) === norm(text))) out.push({ id: `s${out.length}${Math.random().toString(36).slice(2, 7)}`, text, done: false });
  }
  return out;
}
export const SAMPLE: Recipe[] = [
  { id: 'r1', title: 'Espaguete ao alho e óleo', category: 'Massas', minutes: 20, servings: 2, fav: true, ingredients: ['200 g espaguete', '4 dentes de alho', '4 colheres de azeite', '1 pitada de pimenta calabresa', 'Sal a gosto'], steps: ['Cozinhe o espaguete em água salgada até ficar al dente.', 'Doure o alho fatiado no azeite em fogo baixo.', 'Misture a massa com a pimenta e um pouco da água do cozimento.'] },
  { id: 'r2', title: 'Brigadeiro de panela', category: 'Sobremesas', minutes: 25, servings: 12, fav: false, ingredients: ['1 lata de leite condensado', '2 colheres de chocolate em pó', '1 colher de manteiga', 'Granulado para enrolar'], steps: ['Leve tudo ao fogo baixo mexendo sem parar.', 'Pare quando o fundo da panela aparecer.', 'Deixe esfriar, enrole e passe no granulado.'] },
  { id: 'r3', title: 'Salada de grão-de-bico', category: 'Saladas', minutes: 10, servings: 4, fav: false, ingredients: ['2 xícaras de grão-de-bico cozido', '1 1/2 tomate picado', '½ cebola roxa', 'Suco de 1 limão', 'Salsinha a gosto'], steps: ['Misture todos os ingredientes em uma tigela.', 'Tempere com limão e sal e sirva gelada.'] },
];
export function loadJson<T>(raw: string | null, fallback: T, ok: (v: unknown) => boolean): T {
  try { const v = JSON.parse(raw ?? 'null'); return ok(v) ? (v as T) : fallback; } catch { return fallback; }
}
