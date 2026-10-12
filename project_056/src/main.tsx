import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderMarkdown, titleOf, wordCount } from "./markdown";

interface Note { id: string; body: string; updated: number }
const KEY = "p056-notes";
const WELCOME = "# Bem-vindo\n\nEscreva em **Markdown** e veja o resultado ao lado.\n\n- Listas e `código`\n- [x] Tarefas\n\n> Suas notas ficam salvas neste navegador.\n";

function load(): Note[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(v) && v.every((n) => n && typeof n.id === "string" && typeof n.body === "string")) return v;
  } catch { /* ignore */ }
  return [{ id: "n1", body: WELCOME, updated: Date.now() }];
}
const uid = () => "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function App() {
  const [notes, setNotes] = useState<Note[]>(load);
  const [sel, setSel] = useState<string | null>(() => load()[0]?.id ?? null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"edit" | "view">("edit");
  const [saved, setSaved] = useState(true);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* quota */ }
      setSaved(true);
    }, 250);
    return () => clearTimeout(t);
  }, [notes]);

  const note = notes.find((n) => n.id === sel) || null;
  const html = useMemo(() => (note ? renderMarkdown(note.body) : ""), [note?.body]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...notes].sort((a, b) => b.updated - a.updated).filter((n) => !s || n.body.toLowerCase().includes(s));
  }, [notes, q]);

  const add = () => {
    const n = { id: uid(), body: "# Nova nota\n\n", updated: Date.now() };
    setNotes([n, ...notes]); setSel(n.id); setQ(""); setTab("edit");
    setTimeout(() => ta.current?.focus(), 0);
  };
  const edit = (body: string) => setNotes(notes.map((n) => (n.id === sel ? { ...n, body, updated: Date.now() } : n)));
  const del = () => {
    if (!note || !window.confirm(`Excluir "${titleOf(note.body)}"?`)) return;
    const rest = notes.filter((n) => n.id !== note.id);
    setNotes(rest); setSel(rest[0]?.id ?? null);
  };
  const wrap = (a: string, b = a) => {
    const el = ta.current; if (!el || !note) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    edit(value.slice(0, s) + a + value.slice(s, e) + b + value.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + a.length, e + a.length); }, 0);
  };
  const download = () => {
    if (!note) return;
    const url = URL.createObjectURL(new Blob([note.body], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = titleOf(note.body).replace(/\W+/g, "-") + ".md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="top">
        <h1>Notas<span>.md</span></h1>
        <p>Editor Markdown com pré-visualização ao vivo</p>
      </header>
      <aside className="side" aria-label="Lista de notas">
        <div className="side-head">
          <input type="search" placeholder="Buscar notas…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar notas" />
          <button className="primary" onClick={add}>+ Nova</button>
        </div>
        {list.length === 0 ? (
          <p className="empty">{notes.length === 0 ? "Nenhuma nota ainda. Crie a primeira." : "Nada encontrado para a busca."}</p>
        ) : (
          <ul className="notes">
            {list.map((n) => (
              <li key={n.id}>
                <button className={n.id === sel ? "item on" : "item"} onClick={() => setSel(n.id)} aria-current={n.id === sel}>
                  <strong>{titleOf(n.body)}</strong>
                  <small>{new Date(n.updated).toLocaleDateString("pt-BR")} · {wordCount(n.body)} palavras</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className="work">
        {!note ? (
          <div className="blank"><p>Selecione ou crie uma nota para começar.</p></div>
        ) : (
          <>
            <div className="bar">
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={tab === "edit"} onClick={() => setTab("edit")}>Editar</button>
                <button role="tab" aria-selected={tab === "view"} onClick={() => setTab("view")}>Visualizar</button>
              </div>
              <div className="tools">
                <button onClick={() => wrap("**")} aria-label="Negrito"><b>B</b></button>
                <button onClick={() => wrap("*")} aria-label="Itálico"><i>I</i></button>
                <button onClick={() => wrap("`")} aria-label="Código">{"</>"}</button>
                <button onClick={() => wrap("[", "](https://)")} aria-label="Link">Link</button>
                <button onClick={download}>Baixar .md</button>
                <button className="danger" onClick={del}>Excluir</button>
              </div>
            </div>
            <div className={"panes " + tab}>
              <textarea ref={ta} className="editor" value={note.body} onChange={(e) => edit(e.target.value)} spellCheck={false} aria-label="Editor Markdown" />
              <article className="preview" aria-label="Pré-visualização" dangerouslySetInnerHTML={{ __html: html || "<p class='muted'>Nota vazia.</p>" }} />
            </div>
            <footer className="status">{wordCount(note.body)} palavras · {note.body.length} caracteres · <span role="status">{saved ? "salvo" : "salvando…"}</span></footer>
          </>
        )}
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
