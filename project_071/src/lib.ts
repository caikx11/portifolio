export type PlanId = "free" | "pro" | "team";
export interface Plan { id: PlanId; name: string; price: number; seats: number; projects: number; features: string[] }
export interface User { id: string; name: string; email: string; hash: string; plan: PlanId; createdAt: string; usage: { projects: number; seats: number } }
export interface Invoice { id: string; email: string; date: string; plan: PlanId; amount: number; last4: string }
export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

export const PLANS: Plan[] = [
  { id: "free", name: "Gratuito", price: 0, seats: 1, projects: 3, features: ["3 projetos", "1 assento", "Comunidade"] },
  { id: "pro", name: "Pro", price: 29, seats: 5, projects: 50, features: ["50 projetos", "5 assentos", "Suporte por e-mail", "Domínio próprio"] },
  { id: "team", name: "Equipe", price: 99, seats: 25, projects: 500, features: ["500 projetos", "25 assentos", "SSO simulado", "Suporte prioritário"] },
];

export const planById = (id: PlanId): Plan => PLANS.find((p) => p.id === id) as Plan;

export function simpleHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "d" + (h >>> 0).toString(16);
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function luhn(num: string): boolean {
  const d = num.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(d)) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

export function validExpiry(v: string, now = new Date()): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
  if (!m) return false;
  const mm = +m[1], yy = 2000 + +m[2];
  if (mm < 1 || mm > 12) return false;
  return yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1);
}

export class AuthError extends Error {}

export class Store {
  constructor(private kv: KV) {}
  private read<T>(k: string, d: T): T { try { const v = this.kv.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } }
  private write(k: string, v: unknown) { this.kv.setItem(k, JSON.stringify(v)); }
  users(): User[] { return this.read<User[]>("p071.users", []); }
  invoices(email: string): Invoice[] { return this.read<Invoice[]>("p071.invoices", []).filter((i) => i.email === email); }
  session(): User | null { const id = this.read<string | null>("p071.session", null); return this.users().find((u) => u.id === id) ?? null; }

  signUp(name: string, email: string, password: string): User {
    email = email.trim().toLowerCase();
    if (name.trim().length < 2) throw new AuthError("Informe seu nome.");
    if (!validEmail(email)) throw new AuthError("E-mail inválido.");
    if (password.length < 8) throw new AuthError("A senha precisa de pelo menos 8 caracteres.");
    const users = this.users();
    if (users.some((u) => u.email === email)) throw new AuthError("Este e-mail já está cadastrado.");
    const u: User = { id: "u" + Date.now().toString(36) + users.length, name: name.trim(), email, hash: simpleHash(password), plan: "free", createdAt: new Date().toISOString(), usage: { projects: 1, seats: 1 } };
    this.write("p071.users", [...users, u]);
    this.write("p071.session", u.id);
    return u;
  }

  logIn(email: string, password: string): User {
    const u = this.users().find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.hash !== simpleHash(password)) throw new AuthError("E-mail ou senha incorretos.");
    this.write("p071.session", u.id);
    return u;
  }

  logOut() { this.kv.removeItem("p071.session"); }

  private update(u: User) { this.write("p071.users", this.users().map((x) => (x.id === u.id ? u : x))); }

  /** Checkout em modo demonstração: valida o cartão (Luhn) e gera uma fatura fictícia. Nenhuma cobrança real. */
  checkout(plan: PlanId, card: { number: string; expiry: string; cvc: string }): Invoice {
    const u = this.session();
    if (!u) throw new AuthError("Entre na sua conta para assinar.");
    if (plan === u.plan) throw new AuthError("Você já está neste plano.");
    if (!luhn(card.number)) throw new AuthError("Número de cartão inválido (use 4242 4242 4242 4242).");
    if (!validExpiry(card.expiry)) throw new AuthError("Validade inválida ou vencida (MM/AA).");
    if (!/^\d{3,4}$/.test(card.cvc)) throw new AuthError("CVC inválido.");
    if (card.number.replace(/\s/g, "") === "4000000000000002") throw new AuthError("Cartão recusado (cenário de teste).");
    const p = planById(plan);
    const inv: Invoice = { id: "INV-" + String(this.read<Invoice[]>("p071.invoices", []).length + 1).padStart(4, "0"), email: u.email, date: new Date().toISOString(), plan, amount: p.price, last4: card.number.replace(/\s/g, "").slice(-4) };
    this.write("p071.invoices", [...this.read<Invoice[]>("p071.invoices", []), inv]);
    this.update({ ...u, plan, usage: { projects: Math.min(u.usage.projects, p.projects), seats: Math.min(u.usage.seats, p.seats) } });
    return inv;
  }

  cancel(): User {
    const u = this.session();
    if (!u) throw new AuthError("Sessão expirada.");
    const n = { ...u, plan: "free" as PlanId, usage: { projects: Math.min(u.usage.projects, 3), seats: 1 } };
    this.update(n);
    return n;
  }

  /** Ajusta o uso respeitando os limites do plano. */
  addUsage(kind: "projects" | "seats", delta: number): User {
    const u = this.session();
    if (!u) throw new AuthError("Sessão expirada.");
    const limit = planById(u.plan)[kind];
    const next = u.usage[kind] + delta;
    if (next < 0) throw new AuthError("Nada para remover.");
    if (next > limit) throw new AuthError(`Limite do plano ${planById(u.plan).name} atingido (${limit}). Faça upgrade.`);
    const n = { ...u, usage: { ...u.usage, [kind]: next } };
    this.update(n);
    return n;
  }
}
