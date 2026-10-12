'use client';
import { useEffect, useRef, useState } from 'react';
import { plans, computePrice, brl, createDemoOrder } from '../lib/pricing';

const features = [
  ['Eventos em tempo real', 'Veja o que acontece no produto no instante em que acontece.'],
  ['Funis sem SQL', 'Monte funis de conversão arrastando etapas e compare períodos.'],
  ['Alertas inteligentes', 'Seja avisado quando uma métrica sai do normal, no Slack ou e-mail.'],
  ['Privacidade por padrão', 'Sem cookies de terceiros. Dados anonimizados na origem.'],
];
const faqs = [
  ['Posso trocar de plano depois?', 'Sim. Mudanças valem imediatamente e o valor é proporcional.'],
  ['Como funciona o desconto anual?', 'Você paga 12 meses com 20% de desconto sobre o valor mensal.'],
  ['Este checkout cobra de verdade?', 'Não. É uma demonstração: nenhuma cobrança, nenhum gateway e nenhuma chave configurada.'],
];

function Checkout({ plan, seats, annual, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const key = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [onClose]);
  const price = computePrice(plan, seats, annual);
  const submit = (e) => {
    e.preventDefault();
    const r = createDemoOrder({ planId: plan.id, email, seats, annual });
    if (r.ok) { setOrder(r.order); setError(''); } else setError(r.error);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ck-title" onClick={(e) => e.stopPropagation()}>
        <span className="demo-tag">Modo demonstração · sem cobrança</span>
        {order ? (
          <>
            <h2 id="ck-title" ref={ref} tabIndex={-1}>Pedido simulado criado</h2>
            <p>Código <code>{order.id}</code>. Enviaríamos o recibo para <b>{order.email}</b>.</p>
            <p>{order.plan} · {order.seats} assentos · {brl(order.monthly)}/mês ({order.annual ? 'anual' : 'mensal'}).</p>
            <button className="btn primary" onClick={onClose}>Fechar</button>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="ck-title" ref={ref} tabIndex={-1}>Assinar {plan.name}</h2>
            <p className="sum">{seats} assentos · {annual ? 'cobrança anual' : 'cobrança mensal'} · <b>{brl(price.monthly)}/mês</b></p>
            <label>E-mail para o recibo
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" autoComplete="email" />
            </label>
            {error && <p className="err" role="alert">{error}</p>}
            <p className="small">Aqui entraria o Stripe Checkout. Neste projeto nenhum dado de cartão é pedido.</p>
            <div className="row"><button type="button" className="btn" onClick={onClose}>Cancelar</button><button className="btn primary">Confirmar pedido</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [annual, setAnnual] = useState(true);
  const [seats, setSeats] = useState(5);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(0);

  return (
    <>
      <a className="back-link" href="../projetos.html">← Portfólio</a>
      <div className="demo-banner">Projeto de portfólio: checkout em <b>modo demonstração</b>, sem chaves nem cobranças reais.</div>
      <header className="nav"><span className="logo">Faísca<i /></span><nav aria-label="Seções"><a href="#recursos">Recursos</a><a href="#precos">Preços</a><a href="#faq">FAQ</a></nav></header>
      <main>
        <section className="hero">
          <p className="eyebrow">Analytics de produto</p>
          <h1>Entenda seus usuários em <span>minutos</span>, não em sprints.</h1>
          <p className="lead">Eventos, funis e alertas num painel que o time inteiro entende.</p>
          <div className="row center"><a className="btn primary" href="#precos">Ver preços</a><a className="btn" href="#recursos">Conhecer recursos</a></div>
          <div className="mock" aria-hidden="true">{[40, 62, 48, 80, 66, 92, 74].map((h, i) => <b key={i} style={{ height: h + '%' }} />)}</div>
        </section>
        <section id="recursos" className="section">
          <h2>Tudo o que um time de produto precisa</h2>
          <div className="grid4">{features.map(([t, d]) => <article key={t} className="feat"><h3>{t}</h3><p>{d}</p></article>)}</div>
        </section>
        <section id="precos" className="section">
          <h2>Preços simples</h2>
          <div className="controls">
            <div className="toggle" role="group" aria-label="Período de cobrança">
              <button aria-pressed={!annual} className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Mensal</button>
              <button aria-pressed={annual} className={annual ? 'on' : ''} onClick={() => setAnnual(true)}>Anual <small>−20%</small></button>
            </div>
            <label className="seats">Assentos: <b>{seats}</b>
              <input type="range" min="1" max="30" value={seats} onChange={(e) => setSeats(+e.target.value)} />
            </label>
          </div>
          <div className="plans">
            {plans.map((p) => {
              const r = computePrice(p, seats, annual);
              return (
                <article key={p.id} className={`plan ${p.popular ? 'pop' : ''}`}>
                  {p.popular && <span className="badge">Mais popular</span>}
                  <h3>{p.name}</h3><p className="muted">{p.blurb}</p>
                  <p className="price">{brl(r.monthly)}<small>/mês</small></p>
                  <p className="muted small">{r.seats} assentos{r.saved > 0 ? ` · economiza ${brl(r.saved)}/ano` : ''}</p>
                  <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  <button className={`btn ${p.popular ? 'primary' : ''}`} onClick={() => setSelected(p)}>{p.monthly === 0 ? 'Começar grátis' : `Assinar ${p.name}`}</button>
                </article>
              );
            })}
          </div>
        </section>
        <section id="faq" className="section narrow">
          <h2>Perguntas frequentes</h2>
          {faqs.map(([q, a], i) => (
            <div key={q} className="faq">
              <button aria-expanded={open === i} aria-controls={`f${i}`} onClick={() => setOpen(open === i ? -1 : i)}>{q}<span aria-hidden="true">{open === i ? '−' : '+'}</span></button>
              {open === i && <p id={`f${i}`}>{a}</p>}
            </div>
          ))}
        </section>
      </main>
      <footer>© 2026 Faísca (fictício) · Next.js export estático</footer>
      {selected && <Checkout plan={selected} seats={seats} annual={annual} onClose={() => setSelected(null)} />}
    </>
  );
}
