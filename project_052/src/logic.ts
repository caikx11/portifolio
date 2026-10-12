export interface Coin { id: string; symbol: string; name: string; base: number; vol: number; color: string }
export const COINS: Coin[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', base: 64000, vol: 0.004, color: '#fbbf24' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', base: 3200, vol: 0.005, color: '#a78bfa' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', base: 150, vol: 0.008, color: '#2dd4bf' },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', base: 0.45, vol: 0.008, color: '#60a5fa' },
  { id: 'xrp', symbol: 'XRP', name: 'Ripple', base: 0.55, vol: 0.007, color: '#e5e7eb' },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', base: 0.16, vol: 0.012, color: '#f59e0b' },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', base: 7.2, vol: 0.009, color: '#f472b6' },
  { id: 'link', symbol: 'LINK', name: 'Chainlink', base: 14.5, vol: 0.009, color: '#38bdf8' },
];
export const HISTORY_LEN = 120;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function nextPrice(prev: number, vol: number, rnd: () => number): number {
  const shock = (rnd() + rnd() + rnd() - 1.5) * 2; // aprox. normal em [-3,3]
  return Math.max(prev * (1 + shock * vol), prev * 0.5, 1e-6);
}
export function generateHistory(c: Coin, len = HISTORY_LEN, seed = 1): number[] {
  const rnd = mulberry32(seed + c.symbol.charCodeAt(0) * 31 + c.symbol.length);
  const out = [c.base]; while (out.length < len) out.push(nextPrice(out[out.length - 1], c.vol, rnd));
  return out;
}
export function pctChange(series: number[]): number {
  if (series.length < 2 || series[0] === 0) return 0;
  return ((series[series.length - 1] - series[0]) / series[0]) * 100;
}
export function sliceRange(series: number[], n: number): number[] { return series.slice(-Math.max(2, n)); }

export function linePath(series: number[], w: number, h: number, pad = 4): string {
  if (series.length < 2) return '';
  const min = Math.min(...series), max = Math.max(...series), span = max - min || 1;
  return series.map((v, i) => `${i ? 'L' : 'M'}${(pad + (i / (series.length - 1)) * (w - 2 * pad)).toFixed(1)},${(h - pad - ((v - min) / span) * (h - 2 * pad)).toFixed(1)}`).join('');
}
export interface Candle { o: number; h: number; l: number; c: number }
export function toCandles(series: number[], size: number): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < series.length; i += size) { const s = series.slice(i, i + size); out.push({ o: s[0], c: s[s.length - 1], h: Math.max(...s), l: Math.min(...s) }); }
  return out;
}
export function formatUsd(v: number): string {
  const d = v >= 100 ? 2 : v >= 1 ? 3 : 4;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export interface Wallet { cash: number; holdings: Record<string, number>; log: { t: number; side: 'buy' | 'sell'; id: string; qty: number; price: number }[] }
export const START_CASH = 10000;
export const emptyWallet = (): Wallet => ({ cash: START_CASH, holdings: {}, log: [] });
export function trade(w: Wallet, side: 'buy' | 'sell', id: string, qty: number, price: number, t = Date.now()): { wallet: Wallet; error?: string } {
  if (!Number.isFinite(qty) || qty <= 0) return { wallet: w, error: 'Informe uma quantidade maior que zero.' };
  const cost = qty * price;
  const have = w.holdings[id] ?? 0;
  if (side === 'buy' && cost > w.cash + 1e-9) return { wallet: w, error: 'Saldo insuficiente para esta compra.' };
  if (side === 'sell' && qty > have + 1e-12) return { wallet: w, error: 'Você não possui essa quantidade para vender.' };
  const holdings = { ...w.holdings, [id]: side === 'buy' ? have + qty : Math.max(0, have - qty) };
  if (holdings[id] < 1e-12) delete holdings[id];
  return { wallet: { cash: side === 'buy' ? w.cash - cost : w.cash + cost, holdings, log: [{ t, side, id, qty, price }, ...w.log].slice(0, 30) } };
}
export function portfolioValue(w: Wallet, prices: Record<string, number>): number {
  return w.cash + Object.entries(w.holdings).reduce((s, [id, q]) => s + q * (prices[id] ?? 0), 0);
}
export function loadWallet(raw: string | null): Wallet {
  try { const w = JSON.parse(raw ?? 'null'); if (w && typeof w.cash === 'number' && w.holdings && Array.isArray(w.log)) return w; } catch { /* ignore */ }
  return emptyWallet();
}
