import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Board, Card, addCard, deleteCard, deleteColumn, moveCard, moveColumn, renameColumn, updateCard, countCards } from "./board";

const KEY = "p057-board";
const uid = () => Math.random().toString(36).slice(2, 9);
const seed = (): Board => [
  { id: "todo", title: "A fazer", cards: [
    { id: "c1", title: "Desenhar a landing", note: "Esboço no papel primeiro", prio: "media" },
    { id: "c2", title: "Escrever README", note: "", prio: "baixa" } ] },
  { id: "doing", title: "Em andamento", cards: [{ id: "c3", title: "Implementar arrastar e soltar", note: "API nativa de DnD", prio: "alta" }] },
  { id: "done", title: "Concluído", cards: [{ id: "c4", title: "Configurar projeto", note: "", prio: "baixa" }] },
];
function load(): Board {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(v) && v.every((c) => c && typeof c.id === "string" && Array.isArray(c.cards))) return v;
  } catch { /* ignore */ }
  return seed();
}

type Drag = { kind: "card"; id: string } | { kind: "col"; id: string } | null;

function App() {
  const [board, setBoard] = useState<Board>(load);
  const [drag, setDrag] = useState<Drag>(null);
  const [over, setOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<Card | null>(null);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(board)); } catch { /* quota */ } }, [board]);

  const q = filter.trim().toLowerCase();
  const match = (c: Card) => !q || (c.title + " " + c.note).toLowerCase().includes(q);

  const dropCard = (colId: string, index: number) => {
    if (drag?.kind === "card") { setBoard(moveCard(board, drag.id, colId, index)); setMsg("Cartão movido"); }
    else if (drag?.kind === "col") { setBoard(moveColumn(board, drag.id, board.findIndex((c) => c.id === colId))); }
    setDrag(null); setOver(null);
  };
  const shift = (cardId: string, colIdx: number, dir: -1 | 1) => {
    const to = board[colIdx + dir]; if (!to) return;
    setBoard(moveCard(board, cardId, to.id, to.cards.length)); setMsg(`Movido para ${to.title}`);
  };
  const newCol = () => setBoard([...board, { id: uid(), title: "Nova coluna", cards: [] }]);
  const saveCard = (colId: string | null, c: Card) => {
    if (!c.title.trim()) return;
    const clean = { ...c, title: c.title.trim() };
    setBoard(colId ? addCard(board, colId, clean) : updateCard(board, c.id, clean));
    setEditing(null);
  };
  const [newIn, setNewIn] = useState<string | null>(null);

  return (
    <div className="wrap">
      <header className="head">
        <div><h1>Kanban<span> Pro</span></h1><p>{countCards(board)} cartões em {board.length} colunas</p></div>
        <div className="actions">
          <input type="search" placeholder="Filtrar cartões…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar cartões" />
          <button className="btn" onClick={newCol}>+ Coluna</button>
          <button className="btn ghost" onClick={() => { if (window.confirm("Restaurar quadro de exemplo?")) setBoard(seed()); }}>Restaurar</button>
        </div>
      </header>
      <div className="sr" role="status" aria-live="polite">{msg}</div>
      {board.length === 0 ? (
        <div className="empty"><p>O quadro está vazio.</p><button className="btn" onClick={newCol}>Criar primeira coluna</button></div>
      ) : (
        <div className="board">
          {board.map((col, ci) => (
            <section key={col.id}
              className={"col" + (over === col.id ? " over" : "") + (drag?.kind === "col" && drag.id === col.id ? " dragging" : "")}
              onDragOver={(e) => { if (drag) { e.preventDefault(); setOver(col.id); } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
              onDrop={(e) => { e.preventDefault(); dropCard(col.id, col.cards.length); }}
              aria-label={col.title}>
              <div className="col-head" draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", col.id); setDrag({ kind: "col", id: col.id }); }} onDragEnd={() => { setDrag(null); setOver(null); }}>
                <span className="grip" aria-hidden>⠿</span>
                <input className="col-title" value={col.title} aria-label="Título da coluna" onChange={(e) => setBoard(board.map((c) => c.id === col.id ? { ...c, title: e.target.value } : c))}
                  onBlur={(e) => setBoard(renameColumn(board, col.id, e.target.value) === board && !e.target.value.trim() ? board.map((c) => c.id === col.id ? { ...c, title: "Sem nome" } : c) : renameColumn(board, col.id, e.target.value))} draggable={false} onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                <span className="count">{col.cards.length}</span>
                <button className="x" aria-label={`Excluir coluna ${col.title}`} onClick={() => { if (col.cards.length === 0 || window.confirm(`Excluir "${col.title}" e ${col.cards.length} cartões?`)) setBoard(deleteColumn(board, col.id)); }}>×</button>
              </div>
              <ul className="cards">
                {col.cards.filter(match).map((c) => {
                  const idx = col.cards.indexOf(c);
                  return (
                  <li key={c.id}>
                    <article className={"card p-" + c.prio + (drag?.kind === "card" && drag.id === c.id ? " dragging" : "")}
                      draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", c.id); setDrag({ kind: "card", id: c.id }); }}
                      onDragEnd={() => { setDrag(null); setOver(null); }}
                      onDragOver={(e) => { if (drag?.kind === "card") { e.preventDefault(); e.stopPropagation(); setOver(col.id); } }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); dropCard(col.id, idx); }}>
                      <h3>{c.title}</h3>
                      {c.note && <p>{c.note}</p>}
                      <div className="card-foot">
                        <span className="tag">{c.prio}</span>
                        <span className="card-btns">
                          <button aria-label="Mover para a esquerda" disabled={ci === 0} onClick={() => shift(c.id, ci, -1)}>◀</button>
                          <button aria-label="Mover para a direita" disabled={ci === board.length - 1} onClick={() => shift(c.id, ci, 1)}>▶</button>
                          <button aria-label={`Editar ${c.title}`} onClick={() => setEditing(c)}>✎</button>
                          <button aria-label={`Excluir ${c.title}`} onClick={() => setBoard(deleteCard(board, c.id))}>🗑</button>
                        </span>
                      </div>
                    </article>
                  </li>);
                })}
                {col.cards.length === 0 && <li className="hint">Solte cartões aqui</li>}
                {col.cards.length > 0 && q && col.cards.filter(match).length === 0 && <li className="hint">Nenhum resultado</li>}
              </ul>
              <button className="add" onClick={() => { setNewIn(col.id); setEditing({ id: uid(), title: "", note: "", prio: "media" }); }}>+ Adicionar cartão</button>
            </section>
          ))}
        </div>
      )}
      {editing && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Cartão" onKeyDown={(e) => e.key === "Escape" && setEditing(null)}>
          <form className="sheet" onSubmit={(e) => { e.preventDefault(); saveCard(newIn && !board.some((c) => c.cards.some((x) => x.id === editing.id)) ? newIn : null, editing); }}>
            <h2>{board.some((c) => c.cards.some((x) => x.id === editing.id)) ? "Editar cartão" : "Novo cartão"}</h2>
            <label>Título<input autoFocus required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
            <label>Notas<textarea rows={3} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></label>
            <label>Prioridade<select value={editing.prio} onChange={(e) => setEditing({ ...editing, prio: e.target.value as Card["prio"] })}><option value="baixa">baixa</option><option value="media">media</option><option value="alta">alta</option></select></label>
            <div className="row"><button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancelar</button><button className="btn">Salvar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
