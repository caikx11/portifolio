export interface Card { id: string; title: string; note: string; prio: "baixa" | "media" | "alta" }
export interface Column { id: string; title: string; cards: Card[] }
export type Board = Column[];

export const clone = (b: Board): Board => b.map((c) => ({ ...c, cards: [...c.cards] }));

export function moveCard(b: Board, cardId: string, toCol: string, index: number): Board {
  const nb = clone(b);
  let card: Card | undefined;
  for (const c of nb) {
    const i = c.cards.findIndex((x) => x.id === cardId);
    if (i >= 0) { card = c.cards.splice(i, 1)[0]; break; }
  }
  const dest = nb.find((c) => c.id === toCol);
  if (!card || !dest) return b;
  const at = Math.max(0, Math.min(index, dest.cards.length));
  dest.cards.splice(at, 0, card);
  return nb;
}

export function moveColumn(b: Board, colId: string, toIndex: number): Board {
  const i = b.findIndex((c) => c.id === colId);
  if (i < 0) return b;
  const nb = clone(b);
  const [c] = nb.splice(i, 1);
  nb.splice(Math.max(0, Math.min(toIndex, nb.length)), 0, c);
  return nb;
}

export function addCard(b: Board, colId: string, card: Card): Board {
  return b.map((c) => (c.id === colId ? { ...c, cards: [...c.cards, card] } : c));
}
export function updateCard(b: Board, id: string, patch: Partial<Card>): Board {
  return b.map((c) => ({ ...c, cards: c.cards.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
}
export function deleteCard(b: Board, id: string): Board {
  return b.map((c) => ({ ...c, cards: c.cards.filter((x) => x.id !== id) }));
}
export function renameColumn(b: Board, id: string, title: string): Board {
  const t = title.trim();
  return t ? b.map((c) => (c.id === id ? { ...c, title: t } : c)) : b;
}
export function deleteColumn(b: Board, id: string): Board {
  return b.filter((c) => c.id !== id);
}
export function countCards(b: Board): number {
  return b.reduce((n, c) => n + c.cards.length, 0);
}
