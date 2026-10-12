export const plans = [
  { id: 'starter', name: 'Starter', monthly: 0, perSeat: 0, seats: 1, blurb: 'Para testar a ideia.', features: ['1 projeto', '1.000 eventos/mês', 'Painel básico'] },
  { id: 'team', name: 'Team', monthly: 29, perSeat: 9, seats: 3, blurb: 'Para times em crescimento.', features: ['Projetos ilimitados', '1M eventos/mês', 'Alertas e metas', 'Suporte por e-mail'], popular: true },
  { id: 'scale', name: 'Scale', monthly: 99, perSeat: 15, seats: 10, blurb: 'Para operações maiores.', features: ['Tudo do Team', 'SSO e auditoria', 'SLA 99,9%', 'Suporte prioritário'] },
];
export const ANNUAL_DISCOUNT = 0.2;

/** Calcula o preço mensal efetivo: base + assentos extras, com desconto anual. */
export function computePrice(plan, seats, annual) {
  const n = Math.max(plan.seats, Math.floor(Number(seats) || 0));
  const extra = Math.max(0, n - plan.seats) * plan.perSeat;
  const monthlyFull = plan.monthly + extra;
  const monthly = annual ? round(monthlyFull * (1 - ANNUAL_DISCOUNT)) : monthlyFull;
  return { seats: n, monthly, yearly: round(monthly * 12), saved: annual ? round(monthlyFull * 12 - monthly * 12) : 0 };
}
export const round = (v) => Math.round(v * 100) / 100;
export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Checkout SIMULADO: nunca chama gateway algum. Gera um pedido fictício. */
export function createDemoOrder({ planId, email, seats, annual }, now = Date.now()) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return { ok: false, error: 'Informe um e-mail válido.' };
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: 'Plano inválido.' };
  const price = computePrice(plan, seats, annual);
  return { ok: true, order: { id: 'demo_' + now.toString(36), plan: plan.name, email, ...price, annual, demo: true } };
}
