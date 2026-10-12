import { Board, moveCard, moveColumn, renameColumn, countCards } from "../src/board";
const mk = (): Board => [
  { id: "a", title: "A", cards: [{ id: "1", title: "x", note: "", prio: "baixa" }, { id: "2", title: "y", note: "", prio: "alta" }] },
  { id: "b", title: "B", cards: [] },
];
test("move between columns", () => {
  const r = moveCard(mk(), "1", "b", 0);
  expect(r[0].cards.map((c) => c.id)).toEqual(["2"]);
  expect(r[1].cards.map((c) => c.id)).toEqual(["1"]);
  expect(countCards(r)).toBe(2);
});
test("reorder within column", () => {
  expect(moveCard(mk(), "1", "a", 1)[0].cards.map((c) => c.id)).toEqual(["2", "1"]);
});
test("invalid move keeps board", () => {
  const b = mk();
  expect(moveCard(b, "zz", "b", 0)).toBe(b);
  expect(moveCard(b, "1", "zz", 0)).toBe(b);
});
test("columns", () => {
  expect(moveColumn(mk(), "b", 0).map((c) => c.id)).toEqual(["b", "a"]);
  const b = mk();
  expect(renameColumn(b, "a", "  ")).toBe(b);
  expect(renameColumn(b, "a", " Novo ")[0].title).toBe("Novo");
});
