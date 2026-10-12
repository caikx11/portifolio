import { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { CATEGORIES, Recipe, SAMPLE, ShopItem, addToShopping, filterRecipes, lines, loadJson, scaleIngredient, validateRecipe } from './logic';

const RK = 'receituario.recipes', SK = 'receituario.shopping';
const rd = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
type View = { kind: 'list' } | { kind: 'detail'; id: string } | { kind: 'form'; id?: string };

function Form({ initial, onSave, onCancel }: { initial?: Recipe; onSave: (r: Recipe) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [minutes, setMinutes] = useState(String(initial?.minutes ?? 30));
  const [servings, setServings] = useState(String(initial?.servings ?? 4));
  const [ing, setIng] = useState(initial?.ingredients.join('\n') ?? '');
  const [steps, setSteps] = useState(initial?.steps.join('\n') ?? '');
  const [err, setErr] = useState<string | null>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    const e2 = validateRecipe({ title, ingredients: ing, steps, minutes: Number(minutes), servings: Number(servings) });
    if (e2) { setErr(e2); return; }
    onSave({ id: initial?.id ?? 'r' + Date.now(), fav: initial?.fav ?? false, title: title.trim(), category, minutes: Number(minutes), servings: Number(servings), ingredients: lines(ing), steps: lines(steps) });
  }
  return (
    <form className="panel form" onSubmit={submit} noValidate>
      <h2>{initial ? 'Editar receita' : 'Nova receita'}</h2>
      <label htmlFor="f-title">Título</label><input id="f-title" value={title} onChange={e => setTitle(e.target.value)} />
      <div className="three">
        <div><label htmlFor="f-cat">Categoria</label><select id="f-cat" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="f-min">Minutos</label><input id="f-min" type="number" min={1} value={minutes} onChange={e => setMinutes(e.target.value)} /></div>
        <div><label htmlFor="f-srv">Porções</label><input id="f-srv" type="number" min={1} value={servings} onChange={e => setServings(e.target.value)} /></div>
      </div>
      <label htmlFor="f-ing">Ingredientes (um por linha, ex.: 200 g farinha)</label><textarea id="f-ing" rows={5} value={ing} onChange={e => setIng(e.target.value)} />
      <label htmlFor="f-steps">Modo de preparo (um passo por linha)</label><textarea id="f-steps" rows={5} value={steps} onChange={e => setSteps(e.target.value)} />
      {err && <p className="err" role="alert">{err}</p>}
      <div className="actions"><button className="btn" type="submit">Salvar receita</button><button className="btn ghost" type="button" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadJson(rd(RK), SAMPLE, v => Array.isArray(v)));
  const [shop, setShop] = useState<ShopItem[]>(() => loadJson(rd(SK), [] as ShopItem[], v => Array.isArray(v)));
  const [view, setView] = useState<View>({ kind: 'list' });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [onlyFav, setOnlyFav] = useState(false);
  const [servings, setServings] = useState(0);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => wr(RK, recipes), [recipes]);
  useEffect(() => wr(SK, shop), [shop]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); }, [toast]);

  const open = (r: Recipe) => { setServings(r.servings); setDoneSteps([]); setView({ kind: 'detail', id: r.id }); window.scrollTo(0, 0); };
  const current = view.kind !== 'list' && view.id ? recipes.find(r => r.id === view.id) : undefined;
  const shown = filterRecipes(recipes, q, cat, onlyFav);

  function save(r: Recipe) {
    setRecipes(rs => rs.some(x => x.id === r.id) ? rs.map(x => x.id === r.id ? r : x) : [r, ...rs]);
    open(r);
  }
  function del(r: Recipe) { if (confirm(`Excluir "${r.title}"?`)) { setRecipes(rs => rs.filter(x => x.id !== r.id)); setView({ kind: 'list' }); } }

  return (
    <div className="shell">
      <header className="mast">
        <button className="brand" onClick={() => setView({ kind: 'list' })}>Receitário</button>
        <button className="btn" onClick={() => setView({ kind: 'form' })}>+ Nova receita</button>
      </header>
      <div className="layout">
        <main>
          {view.kind === 'form' && <Form initial={current} onSave={save} onCancel={() => setView(current ? { kind: 'detail', id: current.id } : { kind: 'list' })} />}

          {view.kind === 'detail' && !current && <p className="empty">Receita não encontrada. <button className="link" onClick={() => setView({ kind: 'list' })}>Voltar</button></p>}
          {view.kind === 'detail' && current && (
            <article className="panel">
              <button className="link" onClick={() => setView({ kind: 'list' })}>← Todas as receitas</button>
              <p className="kicker">{current.category} · {current.minutes} min</p>
              <h2 className="title">{current.title}</h2>
              <div className="actions">
                <button className="btn ghost" aria-pressed={current.fav} onClick={() => setRecipes(rs => rs.map(x => x.id === current.id ? { ...x, fav: !x.fav } : x))}>{current.fav ? '★ Favorita' : '☆ Favoritar'}</button>
                <button className="btn ghost" onClick={() => setView({ kind: 'form', id: current.id })}>Editar</button>
                <button className="btn ghost danger" onClick={() => del(current)}>Excluir</button>
              </div>
              <div className="scaler"><span id="srv-l">Porções</span>
                <button className="step" aria-label="Menos uma porção" disabled={servings <= 1} onClick={() => setServings(s => s - 1)}>−</button>
                <output aria-labelledby="srv-l">{servings}</output>
                <button className="step" aria-label="Mais uma porção" onClick={() => setServings(s => s + 1)}>+</button>
              </div>
              <h3>Ingredientes</h3>
              <ul className="ings">{current.ingredients.map((i, k) => <li key={k}>{scaleIngredient(i, servings / current.servings)}</li>)}</ul>
              <button className="btn" onClick={() => { setShop(s => addToShopping(s, current.ingredients, servings / current.servings)); setToast('Ingredientes adicionados à lista de compras.'); }}>Adicionar à lista de compras</button>
              <h3>Preparo</h3>
              <ol className="steps">{current.steps.map((s, k) => <li key={k}><label><input type="checkbox" checked={doneSteps.includes(k)} onChange={() => setDoneSteps(d => d.includes(k) ? d.filter(x => x !== k) : [...d, k])} /> <span className={doneSteps.includes(k) ? 'done' : ''}>{s}</span></label></li>)}</ol>
            </article>
          )}

          {view.kind === 'list' && <>
            <div className="filters">
              <label className="sr" htmlFor="q">Buscar receita ou ingrediente</label>
              <input id="q" type="search" placeholder="Buscar receita ou ingrediente…" value={q} onChange={e => setQ(e.target.value)} />
              <label className="sr" htmlFor="cat">Categoria</label>
              <select id="cat" value={cat} onChange={e => setCat(e.target.value)}><option>Todas</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
              <button className={'btn ghost' + (onlyFav ? ' on' : '')} aria-pressed={onlyFav} onClick={() => setOnlyFav(v => !v)}>★ Favoritas</button>
            </div>
            {recipes.length === 0 ? <p className="empty">Nenhuma receita salva. Adicione a primeira com “+ Nova receita”.</p>
              : shown.length === 0 ? <p className="empty">Nenhuma receita encontrada com esses filtros.</p>
              : <ul className="cards">{shown.map(r => <li key={r.id}><button className="rcard" onClick={() => open(r)}>
                  <span className="kicker">{r.category}</span><strong>{r.title}</strong>
                  <span className="meta">{r.minutes} min · {r.servings} porções {r.fav ? '· ★' : ''}</span></button></li>)}</ul>}
          </>}
        </main>

        <aside className="panel shop" aria-labelledby="shop-h">
          <h2 id="shop-h">Lista de compras</h2>
          {shop.length === 0 ? <p className="empty small">Sua lista está vazia.</p> : <>
            <ul>{shop.map(i => <li key={i.id}><label><input type="checkbox" checked={i.done} onChange={() => setShop(s => s.map(x => x.id === i.id ? { ...x, done: !x.done } : x))} /> <span className={i.done ? 'done' : ''}>{i.text}</span></label></li>)}</ul>
            <div className="actions"><button className="btn ghost" onClick={() => setShop(s => s.filter(i => !i.done))}>Remover marcados</button><button className="btn ghost danger" onClick={() => setShop([])}>Limpar tudo</button></div></>}
        </aside>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
