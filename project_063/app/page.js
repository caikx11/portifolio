'use client';
import { useEffect, useState } from 'react';
import { addLink, removeLink, registerClick, totalClicks, host } from '../lib/links';

const initial = [
  { id: 'l1', title: 'Meu portfólio', url: 'https://github.com/', clicks: 0 },
  { id: 'l2', title: 'Newsletter semanal', url: 'https://example.com/newsletter', clicks: 0 },
  { id: 'l3', title: 'Canal de vídeos', url: 'https://example.com/videos', clicks: 0 },
  { id: 'l4', title: 'Agende uma conversa', url: 'https://example.com/agenda', clicks: 0 },
];
const themes = { aurora: 'Aurora', mar: 'Mar', oliva: 'Oliva' };
const KEY = 'aurora-bio-v1';

export default function Home() {
  const [links, setLinks] = useState(initial);
  const [theme, setTheme] = useState('aurora');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ title: '', url: '' });
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) { setLinks(s.links); setTheme(s.theme); } } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify({ links, theme })); } catch {}
  }, [links, theme, ready]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const submit = (e) => {
    e.preventDefault();
    const r = addLink(links, form);
    if (r.error) return setMsg(r.error);
    setLinks(r.links); setForm({ title: '', url: '' }); setMsg('Link adicionado.');
  };
  const share = async () => {
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) await navigator.share({ title: 'Aurora Bio', url });
      else { await navigator.clipboard.writeText(url); setMsg('Endereço da página copiado.'); }
    } catch { setMsg('Não foi possível compartilhar.'); }
  };

  return (
    <>
      <a className="back-link" href="../index.html">← Portfólio</a>
      <main>
        <div className="avatar" aria-hidden="true">AL</div>
        <h1>Ana Luz</h1>
        <p className="bio">Designer e desenvolvedora front-end. Escrevo sobre web, acessibilidade e café.</p>
        <div className="themes" role="group" aria-label="Tema">
          {Object.entries(themes).map(([k, v]) => <button key={k} className={`dot ${k}`} aria-pressed={theme === k} aria-label={`Tema ${v}`} title={v} onClick={() => setTheme(k)} />)}
        </div>
        <ul className="links">
          {links.map((l) => (
            <li key={l.id}>
              <a className="link" href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => setLinks((x) => registerClick(x, l.id))}>
                <span>{l.title}<small>{host(l.url)}</small></span>
                <b aria-label={`${l.clicks} cliques`}>{l.clicks}</b>
              </a>
              {edit && <button className="rm" onClick={() => setLinks((x) => removeLink(x, l.id))} aria-label={`Remover ${l.title}`}>×</button>}
            </li>
          ))}
        </ul>
        {links.length === 0 && <p className="bio">Nenhum link ainda. Ative o modo edição para adicionar.</p>}
        <div className="actions">
          <button onClick={share}>Compartilhar</button>
          <button aria-pressed={edit} onClick={() => { setEdit(!edit); setMsg(''); }}>{edit ? 'Concluir edição' : 'Editar links'}</button>
        </div>
        {edit && (
          <form className="editor" onSubmit={submit} noValidate>
            <label>Título<input value={form.title} maxLength={40} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>URL<input value={form.url} placeholder="seusite.com" onChange={(e) => setForm({ ...form, url: e.target.value })} /></label>
            <button className="add">Adicionar link</button>
          </form>
        )}
        <p className="status" role="status">{msg || (totalClicks(links) ? `${totalClicks(links)} cliques no total (salvos neste navegador)` : '')}</p>
      </main>
    </>
  );
}
