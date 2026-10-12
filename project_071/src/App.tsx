import { useEffect, useMemo, useState } from "react";
import { AuthError, PLANS, Plan, PlanId, Store, User, planById } from "./lib";

const memKV = () => { const m: Record<string, string> = {}; return { getItem: (k: string) => m[k] ?? null, setItem: (k: string, v: string) => { m[k] = v; }, removeItem: (k: string) => { delete m[k]; } }; };
const safeKV = () => { try { localStorage.setItem("p071.t", "1"); localStorage.removeItem("p071.t"); return localStorage; } catch { return memKV(); } };
const money = (n: number) => (n === 0 ? "R$ 0" : `R$ ${n}`);
const fmtDate = (s: string) => new Date(s).toLocaleDateString("pt-BR");
const route = () => (location.hash.replace("#/", "") || "home");

function DemoBanner() {
  return (
    <div role="note" className="border-b border-ink bg-lime px-4 py-2 text-center text-sm font-semibold">
      MODO DEMONSTRAÇÃO · Stripe não está conectado: nenhuma cobrança real é feita e nenhum dado de cartão sai do seu navegador.
    </div>
  );
}

export function App() {
  const store = useMemo(() => new Store(safeKV()), []);
  const [user, setUser] = useState<User | null>(() => store.session());
  const [page, setPage] = useState(route());
  const [checkout, setCheckout] = useState<Plan | null>(null);
  const [toast, setToast] = useState("");
  useEffect(() => { const f = () => setPage(route()); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); }, [toast]);
  const go = (p: string) => { location.hash = "#/" + p; };
  const view = page === "dashboard" && !user ? "login" : (page === "login" || page === "signup") && user ? "dashboard" : page;

  const choose = (p: Plan) => {
    if (!user) { go("signup"); return; }
    if (p.id === user.plan) { go("dashboard"); return; }
    if (p.price === 0) { setUser(store.cancel()); setToast("Voltou ao plano Gratuito."); go("dashboard"); return; }
    setCheckout(p);
  };

  return (
    <>
      <DemoBanner />
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <button onClick={() => go("home")} className="font-serif text-3xl leading-none">Launch<em className="text-violet">pad</em></button>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost" onClick={() => go("pricing")}>Planos</button>
          {user ? (
            <>
              <button className="btn-ghost" onClick={() => go("dashboard")}>Painel</button>
              <button className="btn-primary" onClick={() => { store.logOut(); setUser(null); go("home"); setToast("Você saiu da conta."); }}>Sair</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => go("login")}>Entrar</button>
              <button className="btn-primary" onClick={() => go("signup")}>Criar conta</button>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-20">
        {view === "home" && <Home go={go} />}
        {view === "pricing" && <Pricing plan={user?.plan} choose={choose} />}
        {(view === "login" || view === "signup") && <AuthForm mode={view} store={store} onDone={(u) => { setUser(u); setToast(`Bem-vindo(a), ${u.name}!`); go("dashboard"); }} go={go} />}
        {view === "dashboard" && user && <Dashboard store={store} user={user} setUser={setUser} go={go} setToast={setToast} />}
        {!["home", "pricing", "login", "signup", "dashboard"].includes(view) && (
          <div className="card mt-10 text-center"><h1 className="font-serif text-4xl">Página não encontrada</h1><p className="my-3">O endereço “{view}” não existe.</p><button className="btn-primary" onClick={() => go("home")}>Voltar ao início</button></div>
        )}
      </main>
      {checkout && user && <CheckoutModal plan={checkout} store={store} onClose={() => setCheckout(null)} onDone={(u) => { setUser(u); setCheckout(null); setToast(`Plano ${checkout.name} ativado (demonstração).`); go("dashboard"); }} />}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">{toast && <div className="pointer-events-auto rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg">{toast}</div>}</div>
    </>
  );
}

function Home({ go }: { go: (p: string) => void }) {
  return (
    <section className="py-10 sm:py-16">
      <p className="mb-4 inline-block rounded-full bg-violet-soft px-3 py-1 text-sm font-semibold text-violet-dark">Starter kit para o seu próximo SaaS</p>
      <h1 className="font-serif text-5xl leading-[1.02] sm:text-7xl">Do zero ao <em className="text-violet">primeiro cliente</em> em um fim de semana.</h1>
      <p className="mt-5 max-w-xl text-lg text-ink/75">Cadastro, login, planos, checkout e painel de uso já conectados. Troque o adaptador de pagamento pelo Stripe real quando estiver pronto.</p>
      <div className="mt-8 flex flex-wrap gap-3"><button className="btn-primary" onClick={() => go("signup")}>Começar grátis</button><button className="btn-ghost" onClick={() => go("pricing")}>Ver planos</button></div>
      <ul className="mt-14 grid gap-4 sm:grid-cols-3">
        {[["Autenticação", "Cadastro e login com validação e sessão persistente (local)."], ["Planos e limites", "Free, Pro e Equipe com limites aplicados no painel."], ["Checkout demo", "Cartão validado por Luhn e faturas fictícias. Sem cobrança real."]].map(([t, d]) => (
          <li key={t} className="card"><h2 className="font-serif text-2xl">{t}</h2><p className="mt-1 text-sm text-ink/70">{d}</p></li>
        ))}
      </ul>
    </section>
  );
}

function Pricing({ plan, choose }: { plan?: PlanId; choose: (p: Plan) => void }) {
  return (
    <section className="py-10">
      <h1 className="font-serif text-5xl">Planos simples</h1>
      <p className="mt-2 text-ink/70">Preços fictícios em reais, por mês. Pagamento em modo demonstração.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article key={p.id} className={`card flex flex-col ${p.id === "pro" ? "border-2 border-violet" : ""}`}>
            {p.id === "pro" && <span className="mb-2 w-fit rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold">MAIS ESCOLHIDO</span>}
            <h2 className="font-serif text-3xl">{p.name}</h2>
            <p className="my-2 text-4xl font-bold">{money(p.price)}<span className="text-base font-normal text-ink/60">/mês</span></p>
            <ul className="mb-5 flex-1 space-y-1.5 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <button className={plan === p.id ? "btn-ghost" : "btn-primary"} onClick={() => choose(p)}>{plan === p.id ? "Plano atual" : p.price === 0 ? "Usar grátis" : "Assinar (demo)"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AuthForm({ mode, store, onDone, go }: { mode: string; store: Store; onDone: (u: User) => void; go: (p: string) => void }) {
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  useEffect(() => setErr(""), [mode]);
  const signup = mode === "signup";
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try { onDone(signup ? store.signUp(f.name, f.email, f.password) : store.logIn(f.email, f.password)); } catch (x) { setErr(x instanceof AuthError ? x.message : "Erro inesperado."); }
  };
  return (
    <section className="mx-auto mt-8 max-w-md">
      <form onSubmit={submit} className="card space-y-4" noValidate>
        <h1 className="font-serif text-4xl">{signup ? "Criar conta" : "Entrar"}</h1>
        <p className="text-sm text-ink/60">Contas ficam apenas neste navegador (demonstração).</p>
        {err && <p role="alert" className="err">{err}</p>}
        {signup && <div><label className="label" htmlFor="n">Nome</label><input id="n" className="field" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>}
        <div><label className="label" htmlFor="e">E-mail</label><input id="e" type="email" className="field" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="p">Senha</label><input id="p" type="password" className="field" autoComplete={signup ? "new-password" : "current-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <button className="btn-primary w-full" type="submit">{signup ? "Criar conta" : "Entrar"}</button>
        <p className="text-center text-sm">{signup ? "Já tem conta?" : "Novo por aqui?"} <button type="button" className="font-semibold text-violet underline" onClick={() => go(signup ? "login" : "signup")}>{signup ? "Entrar" : "Criar conta"}</button></p>
      </form>
    </section>
  );
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{value} / {max}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-violet-soft" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemax={max}><div className={`h-full ${pct >= 100 ? "bg-red-500" : "bg-violet"}`} style={{ width: pct + "%" }} /></div>
    </div>
  );
}

function Dashboard({ store, user, setUser, go, setToast }: { store: Store; user: User; setUser: (u: User) => void; go: (p: string) => void; setToast: (s: string) => void }) {
  const [err, setErr] = useState("");
  const p = planById(user.plan);
  const invoices = store.invoices(user.email);
  const bump = (k: "projects" | "seats", d: number) => { try { setUser(store.addUsage(k, d)); setErr(""); } catch (x) { setErr((x as Error).message); } };
  return (
    <section className="py-8">
      <h1 className="font-serif text-5xl">Olá, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-ink/70">Conta desde {fmtDate(user.createdAt)} · {user.email}</p>
      {err && <p role="alert" className="err mt-4">{err} <button className="font-semibold underline" onClick={() => go("pricing")}>Ver planos</button></p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Plano {p.name}</h2><span className="rounded-full bg-violet-soft px-3 py-1 text-sm font-bold text-violet-dark">{money(p.price)}/mês</span></div>
          <Meter label="Projetos" value={user.usage.projects} max={p.projects} />
          <Meter label="Assentos" value={user.usage.seats} max={p.seats} />
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => bump("projects", 1)}>+ Projeto</button>
            <button className="btn-ghost" onClick={() => bump("projects", -1)}>− Projeto</button>
            <button className="btn-ghost" onClick={() => bump("seats", 1)}>+ Assento</button>
            <button className="btn-ghost" onClick={() => bump("seats", -1)}>− Assento</button>
          </div>
        </div>
        <div className="card">
          <h2 className="font-serif text-2xl">Assinatura</h2>
          <p className="mt-1 text-sm text-ink/70">Faturamento em modo demonstração; nenhuma cobrança real.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => go("pricing")}>Mudar de plano</button>
            {user.plan !== "free" && <button className="btn-ghost" onClick={() => { setUser(store.cancel()); setToast("Assinatura cancelada."); }}>Cancelar assinatura</button>}
          </div>
        </div>
      </div>
      <div className="card mt-4">
        <h2 className="font-serif text-2xl">Faturas (fictícias)</h2>
        {invoices.length === 0 ? <p className="mt-2 text-sm text-ink/60">Nenhuma fatura ainda. Assine um plano pago para gerar uma fatura de demonstração.</p> : (
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line"><th className="py-2">Nº</th><th>Data</th><th>Plano</th><th>Cartão</th><th className="text-right">Valor</th></tr></thead>
            <tbody>{[...invoices].reverse().map((i) => <tr key={i.id} className="border-b border-line/60"><td className="py-2 font-mono">{i.id}</td><td>{fmtDate(i.date)}</td><td>{planById(i.plan).name}</td><td>•••• {i.last4}</td><td className="text-right">{money(i.amount)}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </section>
  );
}

function CheckoutModal({ plan, store, onClose, onDone }: { plan: Plan; store: Store; onClose: () => void; onDone: (u: User) => void }) {
  const [c, setC] = useState({ number: "4242 4242 4242 4242", expiry: "12/40", cvc: "123" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const pay = (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    setTimeout(() => { try { store.checkout(plan.id, c); onDone(store.session() as User); } catch (x) { setErr((x as Error).message); setBusy(false); } }, 600);
  };
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60 p-3 sm:items-center" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-labelledby="ck" onSubmit={pay} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md space-y-3" noValidate>
        <p className="rounded-lg bg-lime px-3 py-1.5 text-xs font-bold">CHECKOUT DE DEMONSTRAÇÃO · NENHUMA COBRANÇA REAL</p>
        <h2 id="ck" className="font-serif text-3xl">Assinar {plan.name} · {money(plan.price)}/mês</h2>
        <p className="text-sm text-ink/60">Cartões de teste: 4242 4242 4242 4242 (aprova), 4000 0000 0000 0002 (recusa).</p>
        {err && <p role="alert" className="err">{err}</p>}
        <div><label className="label" htmlFor="cn">Número do cartão</label><input id="cn" autoFocus inputMode="numeric" className="field font-mono" value={c.number} onChange={(e) => setC({ ...c, number: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="ce">Validade (MM/AA)</label><input id="ce" className="field font-mono" value={c.expiry} onChange={(e) => setC({ ...c, expiry: e.target.value })} /></div>
          <div><label className="label" htmlFor="cc">CVC</label><input id="cc" inputMode="numeric" className="field font-mono" value={c.cvc} onChange={(e) => setC({ ...c, cvc: e.target.value })} /></div>
        </div>
        <div className="flex gap-2"><button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancelar</button><button className="btn-primary flex-1" disabled={busy}>{busy ? "Processando…" : "Confirmar (demo)"}</button></div>
      </form>
    </div>
  );
}
