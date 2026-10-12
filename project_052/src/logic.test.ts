import { COINS, emptyWallet, generateHistory, linePath, loadWallet, mulberry32, nextPrice, pctChange, portfolioValue, toCandles, trade } from './logic';
test('rng determinístico', () => { expect(mulberry32(5)()).toBe(mulberry32(5)()); });
test('histórico estável e positivo', () => { const a = generateHistory(COINS[0]); expect(a).toEqual(generateHistory(COINS[0])); expect(a.every(v => v > 0)).toBe(true); expect(a).toHaveLength(120); });
test('nextPrice nunca cai a zero', () => { const r = mulberry32(1); let p = 1; for (let i = 0; i < 1000; i++) p = nextPrice(p, 0.2, r); expect(p).toBeGreaterThan(0); });
test('pctChange', () => { expect(pctChange([100, 110])).toBeCloseTo(10); expect(pctChange([1])).toBe(0); });
test('linePath', () => { expect(linePath([1], 10, 10)).toBe(''); expect(linePath([1, 2, 3], 100, 50)).toMatch(/^M/); });
test('candles', () => { expect(toCandles([1, 3, 2, 5, 4, 6], 3)).toEqual([{ o: 1, h: 3, l: 1, c: 2 }, { o: 5, h: 6, l: 4, c: 6 }]); });
test('compra e venda', () => {
  let w = emptyWallet(); const r1 = trade(w, 'buy', 'btc', 0.1, 50000); expect(r1.error).toBeUndefined(); w = r1.wallet; expect(w.cash).toBe(5000);
  expect(trade(w, 'buy', 'btc', 1, 50000).error).toMatch(/Saldo/);
  expect(trade(w, 'sell', 'eth', 1, 1).error).toMatch(/possui/);
  expect(trade(w, 'buy', 'btc', 0, 1).error).toBeTruthy();
  w = trade(w, 'sell', 'btc', 0.1, 60000).wallet; expect(w.cash).toBe(11000); expect(w.holdings.btc).toBeUndefined();
});
test('valor total e load', () => { const w = { ...emptyWallet(), cash: 100, holdings: { btc: 2 } }; expect(portfolioValue(w, { btc: 10 })).toBe(120); expect(loadWallet('x').cash).toBe(10000); });
