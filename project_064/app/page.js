'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { docs, sections, searchDocs, neighbors } from '../lib/docs';
import { renderMarkdown, headings } from '../lib/markdown';

export default function Home() {
  const [slug, setSlug] = useState(docs[0].slug);
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState('');
  const search = useRef(null);
  const article = useRef(null);

  useEffect(() => {
    const read = () => { const h = window.location.hash.replace(/^#\/?/, ''); setSlug(docs.some((d) => d.slug === h) ? h : docs[0].slug); setMenu(false); window.scrollTo(0, 0); };
    read();
    window.addEventListener('hashchange', read);
    const key = (e) => {
      const typing = /input|textarea/i.test(e.target.tagName);
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); search.current?.focus(); }
      if (e.key === 'Escape') { setQuery(''); setMenu(false); }
    };
    document.addEventListener('keydown', key);
    return () => { window.removeEventListener('hashchange', read); document.removeEventListener('keydown', key); };
  }, []);

  const doc = docs.find((d) => d.slug === slug);
  const html = useMemo(() => renderMarkdown(doc.body), [doc]);
  const toc = useMemo(() => headings(doc.body), [doc]);
  const results = useMemo(() => searchDocs(docs, query), [query]);
  const { prev, next } = neighbors(docs, slug);

  useEffect(() => {
    document.title = `${doc.title} — Trilha Docs`;
    article.current?.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy')) return;
      const b = document.createElement('button');
      b.className = 'copy'; b.type = 'button'; b.textContent = 'Copiar';
      b.onclick = async () => { try { await navigator.clipboard.writeText(pre.querySelector('code').innerText); setCopied(doc.slug + Math.random()); b.textContent = 'Copiado'; setTimeout(() => (b.textContent = 'Copiar'), 1500); } catch { b.textContent = 'Falhou'; } };
      pre.appendChild(b);
    });
  }, [doc, html]);

  return (
    <>
      <a className="back-link" href="../projetos.html">← Portfólio</a>
      <header className="top">
        <button className="burger" aria-label="Abrir menu" aria-expanded={menu} aria-controls="side" onClick={() => setMenu(!menu)}>☰</button>
        <a className="logo" href="#/introducao"><span aria-hidden="true">▲</span> Trilha<small>docs</small></a>
        <div className="searchbox">
          <label className="sr" htmlFor="q">Buscar na documentação</label>
          <input id="q" ref={search} type="search" placeholder="Buscar…  ( / )" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
          {query && (
            <ul className="results" aria-label="Resultados da busca">
              {results.length === 0 && <li className="none">Nada encontrado para “{query}”.</li>}
              {results.map((r) => (
                <li key={r.doc.slug}><a href={`#/${r.doc.slug}`} onClick={() => setQuery('')}><b>{r.doc.title}</b><span>{r.snippet}</span></a></li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <div className="layout">
        <nav id="side" className={`side ${menu ? 'open' : ''}`} aria-label="Documentação">
          {sections.map((s) => (
            <div key={s}>
              <h2>{s}</h2>
              <ul>{docs.filter((d) => d.section === s).map((d) => <li key={d.slug}><a href={`#/${d.slug}`} aria-current={d.slug === slug ? 'page' : undefined}>{d.title}</a></li>)}</ul>
            </div>
          ))}
        </nav>
        <main>
          <p className="crumb">{doc.section} / {doc.title}</p>
          <h1>{doc.title}</h1>
          <div ref={article} className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="pager">
            {prev ? <a href={`#/${prev.slug}`}><small>Anterior</small>← {prev.title}</a> : <span />}
            {next ? <a className="r" href={`#/${next.slug}`}><small>Próximo</small>{next.title} →</a> : <span />}
          </div>
        </main>
        <aside className="toc" aria-label="Nesta página">
          {toc.length > 0 && <><h2>Nesta página</h2><ul>{toc.map((t) => <li key={t.id}><a href={`#/${slug}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{t.text}</a></li>)}</ul></>}
        </aside>
      </div>
    </>
  );
}
