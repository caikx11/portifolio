'use client';
import { useCallback, useEffect, useState } from 'react';

interface P { id: number; title: string; body: string; excerpt: string; published: boolean }
const empty = { title: '', body: '', excerpt: '', published: false };

export default function Admin() {
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [posts, setPosts] = useState<P[]>([]);
  const [edit, setEdit] = useState<(typeof empty & { id?: number })>(empty);
  const [msg, setMsg] = useState('');
  const h = useCallback(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

  const load = useCallback(async () => {
    if (!token) return;
    const r = await fetch('/api/posts?all=1', { headers: h() }); if (r.ok) setPosts(await r.json());
  }, [token, h]);
  useEffect(() => { load(); }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    const b = await r.json(); r.ok ? (setToken(b.token), setMsg('')) : setMsg(b.error);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(edit.id ? `/api/posts/${edit.id}` : '/api/posts', { method: edit.id ? 'PUT' : 'POST', headers: h(), body: JSON.stringify({ title: edit.title, body: edit.body, excerpt: edit.excerpt || undefined, published: edit.published }) });
    const b = await r.json(); if (!r.ok) return setMsg(b.error);
    setMsg('Salvo!'); setEdit(empty); load();
  }
  async function del(id: number) { await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: h() }); load(); }

  if (!token) return (<form onSubmit={login}><h1>Painel</h1><label>Senha<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label><button>Entrar</button><p role="alert">{msg}</p></form>);
  return (<>
    <h1>Painel de posts</h1>
    <form onSubmit={save}>
      <label>Título<input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
      <label>Resumo<input value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} /></label>
      <label>Texto<textarea rows={6} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></label>
      <label><input type="checkbox" style={{ width: 'auto' }} checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} /> Publicado</label>
      <button>{edit.id ? 'Atualizar' : 'Criar'}</button><span role="status">{msg}</span>
    </form>
    <ul>{posts.map((p) => (<li key={p.id}>{p.title} {p.published ? '(publicado)' : '(rascunho)'} <button type="button" onClick={() => setEdit(p)}>Editar</button><button type="button" onClick={() => del(p.id)}>Excluir</button></li>))}</ul>
  </>);
}
