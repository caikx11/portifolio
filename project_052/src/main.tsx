import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { COINS, HISTORY_LEN, Wallet, Candle, formatUsd, generateHistory, linePath, loadWallet, mulberry32, nextPrice, pctChange, portfolioValue, sliceRange, toCandles, trade, emptyWallet } from './logic';

const WALLET_KEY = 'cripto.wallet', FAV_KEY = 'cripto.favs';
const RANGES = [{ l: '30', n: 30 }, { l: '60', n: 60 }, { l: '120', n: 120 }];
type Hist = Record<string, number[]>;
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

function Chart({ series, color, mode }: { series: number[]; color: string; mode: 'linha' | 'velas' }) {
  const W = 640, H = 280;
  const min = Math.min(...series), max = Math.max(...series);
  const ticks = [0, 1, 2, 3].map(i => min + ((max - min) * i) / 3);
  const y = (v: number) => H - 8 - ((v - min) / (max - min || 1)) * (H - 16);
  const candles: Candle[] = mode === 'velas' ? toCandles(series, Math.max(1, Math.round(series.length / 30))) : [];
  const d = linePath(series, W, H, 8);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Gráfico ${mode} com ${series.length} pontos, de ${formatUsd(min)} a ${formatUsd(max)}`}>
      <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {ticks.map((t, i) => <g key={i}><line x1="0" x2={W} y1={y(t)} y2={y(t)} stroke="#2d2845" strokeDasharray="3 5" /><text x="6" y={y(t) - 3} fill="#9a93b8" fontSize="11">{formatUsd(t)}</text></g>)}
      {mode === 'linha' ? <>
        <path d={`${d}L${W - 8},${H}L8,${H}Z`} fill="url(#fill)" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      </> : candles.map((c, i) => {
        const x = 12 + (i / candles.length) * (W - 24), w = Math.max(4, ((W - 24) / candles.length) * 0.6), up = c.c >= c.o;
        return <g key={i} stroke={up ? '#34d399' : '#fb7185'} fill={up ? '#34d399' : '#fb7185'}>
          <line x1={x + w / 2} x2={x + w / 2} y1={y(c.h)} y2={y(c.l)} /><rect x={x} y={Math.min(y(c.o), y(c.c))} width={w} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} /></g>;
      })}
    </svg>
  );
}
function Spark({ series, up }: { series: number[]; up: boolean }) {
  return <svg viewBox="0 0 70 28" width="70" height="28" aria-hidden="true"><path d={linePath(series.slice(-40), 70, 28, 2)} fill="none" stroke={up ? '#34d399' : '#fb7185'} strokeWidth="1.8" /></svg>;
}

function App() {
  const [hist, setHist] = useState<Hist>(() => Object.fromEntries(COINS.map(c => [c.id, generateHistory(c)])));
  const [sel, setSel] = useState('btc');
  const [range, setRange] = useState(60);
  const [mode, setMode] = useState<'linha' | 'velas'>('linha');
  const [live, setLive] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('mercado');
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => { try { const v = JSON.parse(read(FAV_KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; } });
  const [wallet, setWallet] = useState<Wallet>(() => loadWallet(read(WALLET_KEY)));
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const rnd = useRef(mulberry32(Date.now() % 100000));

  useEffect(() => write(WALLET_KEY, JSON.stringify(wallet)), [wallet]);
  useEffect(() => write(FAV_KEY, JSON.stringify(favs)), [favs]);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setHist(h => Object.fromEntries(COINS.map(c => [c.id, [...h[c.id].slice(-(HISTORY_LEN - 1)), nextPrice(h[c.id][h[c.id].length - 1], c.vol, rnd.current)]]))), 1500);
    return () => clearInterval(id);
  }, [live]);

  const prices = useMemo(() => Object.fromEntries(COINS.map(c => [c.id, hist[c.id][hist[c.id].length - 1]])), [hist]);
  const coin = COINS.find(c => c.id === sel)!;
  const series = sliceRange(hist[sel], range);
  const ch = pctChange(series);
  const rows = COINS.filter(c => (!onlyFav || favs.includes(c.id)) && (c.name + c.symbol).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => sort === 'nome' ? a.name.localeCompare(b.name) : sort === 'preco' ? prices[b.id] - prices[a.id] : sort === 'variacao' ? pctChange(hist[b.id].slice(-60)) - pctChange(hist[a.id].slice(-60)) : COINS.indexOf(a) - COINS.indexOf(b));
  const total = portfolioValue(wallet, prices);
  const pl = total - 10000;

  function doTrade(side: 'buy' | 'sell') {
    const r = trade(wallet, side, sel, parseFloat(qty.replace(',', '.')), prices[sel]);
    if (r.error) { setMsg({ ok: false, t: r.error }); return; }
    setWallet(r.wallet); setQty(''); setMsg({ ok: true, t: `${side === 'buy' ? 'Compra' : 'Venda'} de ${qty} ${coin.symbol} executada (simulada).` });
  }
  const toggleFav = (id: string) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return (
    <div className="app">
      <header className="top">
        <div><h1>Cripto<span>Deck</span></h1><p className="sub">Mercado simulado — nenhum dado real, nenhum dinheiro de verdade.</p></div>
        <div className={'live ' + (live ? '' : 'paused')}><span className="dot" />{live ? 'Ao vivo (simulado)' : 'Pausado'}
          <button className="btn" onClick={() => setLive(l => !l)} aria-pressed={!live}>{live ? 'Pausar' : 'Retomar'}</button></div>
      </header>

      <div className="grid">
        <section className="card" aria-labelledby="mk">
          <h2 id="mk">Mercado</h2>
          <div className="tools">
            <label className="sr" htmlFor="q">Buscar moeda</label><input id="q" type="search" placeholder="Buscar moeda…" value={q} onChange={e => setQ(e.target.value)} />
            <label className="sr" htmlFor="so">Ordenar</label>
            <select id="so" value={sort} onChange={e => setSort(e.target.value)}><option value="mercado">Padrão</option><option value="nome">Nome</option><option value="preco">Preço</option><option value="variacao">Variação</option></select>
            <button className={'btn ' + (onlyFav ? 'on' : '')} aria-pressed={onlyFav} onClick={() => setOnlyFav(v => !v)}>★ Favoritas</button>
          </div>
          {rows.length === 0 ? <p className="empty">{onlyFav && !q ? 'Você ainda não favoritou nenhuma moeda.' : 'Nenhuma moeda encontrada.'}</p> :
            <ul className="coins">{rows.map(c => { const s = hist[c.id].slice(-60), p = pctChange(s); return (
              <li key={c.id} className="row">
                <button className={'star ' + (favs.includes(c.id) ? 'on' : '')} aria-pressed={favs.includes(c.id)} aria-label={`Favoritar ${c.name}`} onClick={() => toggleFav(c.id)}>★</button>
                <button className="coin" aria-pressed={sel === c.id} onClick={() => { setSel(c.id); setMsg(null); }}>
                  <Spark series={s} up={p >= 0} />
                  <span><b>{c.symbol}</b><small>{c.name}</small></span>
                  <span className="p">{formatUsd(prices[c.id])}<small className={p >= 0 ? 'up' : 'down'}>{p >= 0 ? '▲' : '▼'} {Math.abs(p).toFixed(2)}%</small></span>
                </button></li>); })}</ul>}
        </section>

        <section className="card" aria-labelledby="dt">
          <h2 id="dt">{coin.name} · {coin.symbol}</h2>
          <div className="big"><span className="price">{formatUsd(prices[sel])}</span><span className={ch >= 0 ? 'up' : 'down'}>{ch >= 0 ? '▲' : '▼'} {Math.abs(ch).toFixed(2)}% no período</span></div>
          <div className="seg" role="group" aria-label="Período e tipo">
            {RANGES.map(r => <button key={r.n} className={'btn ' + (range === r.n ? 'on' : '')} aria-pressed={range === r.n} onClick={() => setRange(r.n)}>{r.l} pts</button>)}
            <button className={'btn ' + (mode === 'linha' ? 'on' : '')} aria-pressed={mode === 'linha'} onClick={() => setMode('linha')}>Linha</button>
            <button className={'btn ' + (mode === 'velas' ? 'on' : '')} aria-pressed={mode === 'velas'} onClick={() => setMode('velas')}>Velas</button>
          </div>
          <Chart series={series} color={coin.color} mode={mode} />
          <div className="stats">
            <div className="stat"><span>Máxima</span><b>{formatUsd(Math.max(...series))}</b></div>
            <div className="stat"><span>Mínima</span><b>{formatUsd(Math.min(...series))}</b></div>
            <div className="stat"><span>Você possui</span><b>{(wallet.holdings[sel] ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 6 })} {coin.symbol}</b></div>
          </div>
          <div className="trade">
            <label className="sr" htmlFor="qty">Quantidade de {coin.symbol}</label>
            <input id="qty" inputMode="decimal" placeholder={`Quantidade de ${coin.symbol}`} value={qty} onChange={e => setQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && doTrade('buy')} />
            <button className="btn buy" onClick={() => doTrade('buy')}>Comprar</button>
            <button className="btn sell" onClick={() => doTrade('sell')}>Vender</button>
          </div>
          {msg && <p className={msg.ok ? 'ok' : 'err'} role={msg.ok ? 'status' : 'alert'}>{msg.t}</p>}
        </section>
      </div>

      <div className="lower">
        <section className="card" aria-labelledby="pf">
          <h2 id="pf">Carteira simulada</h2>
          <div className="stats" style={{ marginTop: 0 }}>
            <div className="stat"><span>Patrimônio</span><b>{formatUsd(total)}</b></div>
            <div className="stat"><span>Saldo em USD</span><b>{formatUsd(wallet.cash)}</b></div>
            <div className="stat"><span>Resultado</span><b className={pl >= 0 ? 'up' : 'down'}>{pl >= 0 ? '+' : '−'}{formatUsd(Math.abs(pl))}</b></div>
          </div>
          {Object.keys(wallet.holdings).length === 0 ? <p className="empty">Carteira sem ativos. Compre uma moeda para começar.</p> :
            <table><thead><tr><th>Ativo</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>
              {Object.entries(wallet.holdings).map(([id, qd]) => <tr key={id}><td>{COINS.find(c => c.id === id)?.symbol}</td><td>{qd.toLocaleString('pt-BR', { maximumFractionDigits: 6 })}</td><td>{formatUsd(qd * prices[id])}</td></tr>)}</tbody></table>}
          <p style={{ marginTop: 10 }}><button className="btn" onClick={() => { if (confirm('Reiniciar a carteira com US$ 10.000?')) { setWallet(emptyWallet()); setMsg(null); } }}>Reiniciar carteira</button></p>
        </section>
        <section className="card" aria-labelledby="hs">
          <h2 id="hs">Histórico de ordens</h2>
          {wallet.log.length === 0 ? <p className="empty">Nenhuma ordem executada.</p> :
            <ul className="log">{wallet.log.map((o, i) => <li key={i}><span className={o.side === 'buy' ? 'up' : 'down'}>{o.side === 'buy' ? 'Compra' : 'Venda'} {o.qty} {COINS.find(c => c.id === o.id)?.symbol}</span><span>{formatUsd(o.price)} · {new Date(o.t).toLocaleTimeString('pt-BR')}</span></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
