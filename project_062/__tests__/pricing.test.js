import { plans, computePrice, createDemoOrder } from '../lib/pricing.js';
const team = plans.find((p) => p.id === 'team');
test('assentos incluídos não custam extra', () => expect(computePrice(team, 3, false).monthly).toBe(29));
test('assentos extras somam', () => expect(computePrice(team, 5, false).monthly).toBe(29 + 18));
test('desconto anual de 20%', () => { const r = computePrice(team, 3, true); expect(r.monthly).toBe(23.2); expect(r.yearly).toBe(278.4); expect(r.saved).toBe(69.6); });
test('assentos nunca abaixo do incluído', () => expect(computePrice(team, 0, false).seats).toBe(3));
test('pedido demo valida e-mail e marca demo', () => {
  expect(createDemoOrder({ planId: 'team', email: 'x', seats: 3 }).ok).toBe(false);
  const r = createDemoOrder({ planId: 'team', email: 'a@b.co', seats: 3, annual: false });
  expect(r.ok).toBe(true); expect(r.order.demo).toBe(true); expect(r.order.id.startsWith('demo_')).toBe(true);
});
