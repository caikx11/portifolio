import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import data from "./movies.json";
import { DEFAULT_FILTERS, Filters, Movie, Sort, decadesOf, filterMovies, genresOf, hue, toggleFav } from "./catalog";

const movies = data as Movie[];
const KEY = "p060-state";
function load(): { favs: number[]; f: Filters } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && Array.isArray(v.favs)) return { favs: v.favs.filter((x: unknown) => typeof x === "number"), f: { ...DEFAULT_FILTERS, ...(v.f || {}) } };
  } catch { /* ignore */ }
  return { favs: [], f: DEFAULT_FILTERS };
}

function Poster({ m }: { m: Movie }) {
  const h = hue(m.title);
  return (
    <div className="poster" style={{ background: `linear-gradient(160deg,hsl(${h} 60% 32%),hsl(${(h + 50) % 360} 55% 12%))` }} aria-hidden="true">
      <span>{m.title}</span><i>{m.year}</i>
    </div>
  );
}

function App() {
  const init = useMemo(load, []);
  const [favs, setFavs] = useState<number[]>(init.favs);
  const [f, setF] = useState<Filters>(init.f);
  const [open, setOpen] = useState<Movie | null>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ favs, f })); } catch { /* quota */ } }, [favs, f]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);

  const genres = useMemo(() => genresOf(movies), []);
  const decades = useMemo(() => decadesOf(movies), []);
  const list = useMemo(() => filterMovies(movies, f, favs), [f, favs]);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF({ ...f, [k]: v });
  const dirty = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="page">
      <header>
        <h1>CINE<span>TECA</span></h1>
        <p>{movies.length} filmes · {favs.length} favoritos</p>
      </header>
      <section className="filters" aria-label="Filtros">
        <input type="search" value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Buscar título ou diretor…" aria-label="Buscar" />
        <select value={f.genre} onChange={(e) => set("genre", e.target.value)} aria-label="Gênero"><option value="">Todos os gêneros</option>{genres.map((g) => <option key={g}>{g}</option>)}</select>
        <select value={f.decade ?? ""} onChange={(e) => set("decade", e.target.value ? Number(e.target.value) : null)} aria-label="Década"><option value="">Todas as décadas</option>{decades.map((d) => <option key={d} value={d}>{d}s</option>)}</select>
        <select value={f.minRating} onChange={(e) => set("minRating", Number(e.target.value))} aria-label="Nota mínima"><option value={0}>Qualquer nota</option><option value={8}>8+ </option><option value={8.5}>8,5+</option><option value={9}>9+</option></select>
        <select value={f.sort} onChange={(e) => set("sort", e.target.value as Sort)} aria-label="Ordenar"><option value="rating">Melhor nota</option><option value="year">Mais recentes</option><option value="title">A–Z</option></select>
        <button className={"fav-toggle" + (f.onlyFav ? " on" : "")} aria-pressed={f.onlyFav} onClick={() => set("onlyFav", !f.onlyFav)}>♥ Favoritos</button>
        {dirty && <button className="clear" onClick={() => setF(DEFAULT_FILTERS)}>Limpar</button>}
      </section>
      <p className="count" role="status">{list.length} {list.length === 1 ? "filme" : "filmes"}</p>
      {list.length === 0 ? (
        <div className="empty">
          <p>{f.onlyFav && favs.length === 0 ? "Você ainda não favoritou nenhum filme. Toque no ♥ de um cartaz." : "Nenhum filme encontrado com esses filtros."}</p>
          <button onClick={() => setF(DEFAULT_FILTERS)}>Limpar filtros</button>
        </div>
      ) : (
        <ul className="grid">
          {list.map((m) => (
            <li key={m.id}>
              <button className="open" onClick={() => setOpen(m)} aria-label={`Detalhes de ${m.title}`}>
                <Poster m={m} />
                <span className="meta"><b>{m.title}</b><small>{m.genres.join(" · ")}</small></span>
              </button>
              <span className="badge">★ {m.rating.toFixed(1)}</span>
              <button className={"heart" + (favs.includes(m.id) ? " on" : "")} aria-pressed={favs.includes(m.id)} aria-label={`Favoritar ${m.title}`} onClick={() => setFavs(toggleFav(favs, m.id))}>♥</button>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={open.title} onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="sheet">
            <Poster m={open} />
            <div className="info">
              <h2>{open.title}</h2>
              <p className="sub">{open.year} · {open.runtime} min · ★ {open.rating.toFixed(1)}</p>
              <p className="sub">Direção: {open.director}</p>
              <p>{open.synopsis}</p>
              <p className="tags">{open.genres.map((g) => <span key={g}>{g}</span>)}</p>
              <div className="row">
                <button onClick={() => setFavs(toggleFav(favs, open.id))} aria-pressed={favs.includes(open.id)}>{favs.includes(open.id) ? "♥ Nos favoritos" : "♡ Favoritar"}</button>
                <button autoFocus onClick={() => setOpen(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
