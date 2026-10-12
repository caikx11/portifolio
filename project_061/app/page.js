'use client';
import { useEffect, useMemo, useState } from 'react';
import { posts } from '../lib/posts';
import { renderMarkdown, readingTime, filterPosts } from '../lib/markdown';

const fmt = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

export default function Home() {
  const [slug, setSlug] = useState('');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    const read = () => setSlug(window.location.hash.replace(/^#\/?/, ''));
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const post = posts.find((p) => p.slug === slug);
  useEffect(() => { document.title = post ? `${post.title} — Maré Alta` : 'Maré Alta — Blog Next'; if (post) window.scrollTo(0, 0); }, [post]);
  const list = useMemo(() => filterPosts(posts, { query, tag }), [query, tag]);
  const html = useMemo(() => (post ? renderMarkdown(post.body) : ''), [post]);

  return (
    <>
      <a className="back-link" href="../index.html">← Portfólio</a>
      <header className="masthead">
        <a className="brand" href="#/" aria-label="Maré Alta, início">Maré Alta</a>
        <p className="tagline">Anotações sobre web, design e código.</p>
      </header>
      <main id="conteudo">
        {post ? (
          <article className="post">
            <a className="ghost" href="#/">← Todos os posts</a>
            <p className="meta">{fmt(post.date)} · {readingTime(post.body)} min de leitura</p>
            <h1>{post.title}</h1>
            <div className="tags">{post.tags.map((t) => <span key={t} className="chip static">#{t}</span>)}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        ) : (
          <>
            <section className="tools" aria-label="Filtros">
              <label className="search">
                <span className="sr">Buscar posts</span>
                <input type="search" placeholder="Buscar posts…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <div className="tags" role="group" aria-label="Filtrar por tag">
                <button className={`chip ${tag === '' ? 'on' : ''}`} aria-pressed={tag === ''} onClick={() => setTag('')}>todos</button>
                {allTags.map((t) => (
                  <button key={t} className={`chip ${tag === t ? 'on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>#{t}</button>
                ))}
              </div>
            </section>
            <p className="count" aria-live="polite">{list.length} {list.length === 1 ? 'post' : 'posts'}</p>
            <ul className="cards">
              {list.map((p) => (
                <li key={p.slug}>
                  <a className="card" href={`#/${p.slug}`}>
                    <span className="meta">{fmt(p.date)} · {readingTime(p.body)} min</span>
                    <h2>{p.title}</h2>
                    <p>{p.excerpt}</p>
                    <span className="more">Ler post →</span>
                  </a>
                </li>
              ))}
            </ul>
            {list.length === 0 && <p className="empty">Nenhum post encontrado. Tente outro termo ou limpe o filtro.</p>}
          </>
        )}
      </main>
      <footer>Feito com Next.js (export estático) · posts em Markdown/JSON</footer>
    </>
  );
}
