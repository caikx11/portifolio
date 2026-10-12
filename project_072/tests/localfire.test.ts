import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, connectedTabs, ChannelLike, KV } from "../src/localfire";

const kv = (): KV => { const m: Record<string, string> = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
// barramento falso: entrega mensagens a todos os outros canais (como o BroadcastChannel)
function bus() {
  const all: ChannelLike[] = [];
  return () => { const c: ChannelLike = { onmessage: null, postMessage(m) { all.filter((o) => o !== c).forEach((o) => o.onmessage?.({ data: m })); }, close() {} }; all.push(c); return c; };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

test("addDoc/updateDoc/deleteDoc e onSnapshot com docChanges", async () => {
  const db = getFirestore({ storage: kv(), channel: () => null });
  const col = collection(db, "t"); const seen: string[][] = []; const types: string[] = [];
  const un = onSnapshot(query(col, orderBy("n", "asc")), (s) => { seen.push(s.docs.map((d) => d.data().n)); s.docChanges().forEach((c) => types.push(c.type)); });
  await tick(); expect(seen[0]).toEqual([]);
  const a = await addDoc(col, { n: 2 }); await addDoc(col, { n: 1 });
  expect(seen[seen.length - 1]).toEqual([1, 2]);
  await updateDoc(a, { n: 3 }); expect(seen[seen.length - 1]).toEqual([1, 3]);
  await deleteDoc(a); expect(seen[seen.length - 1]).toEqual([1]);
  expect(types).toEqual(["added", "added", "modified", "removed"]);
  un(); await addDoc(col, { n: 9 }); expect(seen[seen.length - 1]).toEqual([1]);
});

test("where/orderBy desc e erro em updateDoc de documento inexistente", async () => {
  const db = getFirestore({ storage: kv(), channel: () => null }); const col = collection(db, "t");
  await addDoc(col, { n: 1, ok: true }); await addDoc(col, { n: 2, ok: false }); await addDoc(col, { n: 3, ok: true });
  let got: number[] = [];
  onSnapshot(query(col, where("ok", "==", true), orderBy("n", "desc")), (s) => { got = s.docs.map((d) => d.data().n); });
  await tick(); expect(got).toEqual([3, 1]);
  await expect(updateDoc(doc(db, "t", "nope"), { n: 1 })).rejects.toThrow(/not-found/);
});

test("sincroniza entre duas 'abas' (mesmo storage + canal)", async () => {
  const shared = kv(); const mk = bus();
  const A = getFirestore({ storage: shared, channel: mk }); const B = getFirestore({ storage: shared, channel: mk });
  let countB = -1; onSnapshot(collection(B, "t"), (s) => { countB = s.size; });
  await tick(); expect(countB).toBe(0);
  await addDoc(collection(A, "t"), { x: 1 });
  expect(countB).toBe(1);
  expect(connectedTabs(A)).toBe(2);
});
