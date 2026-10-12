/**
 * localfire: adaptador local com a MESMA forma da API modular do Firestore
 * (getFirestore, collection, doc, query, orderBy, where, addDoc, setDoc, updateDoc,
 * deleteDoc, onSnapshot, serverTimestamp). Persiste em storage e sincroniza abas via BroadcastChannel.
 * Para usar o Firebase real, troque o import (veja README).
 */
export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }
export interface ChannelLike { postMessage(m: unknown): void; onmessage: ((e: { data: any }) => void) | null; close(): void }
export interface DbOptions { storage?: KV; channel?: (name: string) => ChannelLike | null; name?: string }
type Data = Record<string, any>;
const TS = { __ts: true };
export const serverTimestamp = () => TS;

export interface Db { name: string; kv: KV; chan: ChannelLike | null; listeners: Set<() => void>; tabId: string; presence: Map<string, number>; presenceListeners: Set<(n: number) => void> }
export interface CollectionRef { type: "collection"; db: Db; path: string }
export interface DocRef { type: "doc"; db: Db; path: string; id: string }
export interface Constraint { kind: "orderBy" | "where"; field: string; dir?: "asc" | "desc"; op?: string; value?: any }
export interface QueryRef { type: "query"; col: CollectionRef; constraints: Constraint[] }
export interface QueryDocumentSnapshot { id: string; ref: DocRef; data(): Data }
export interface DocumentChange { type: "added" | "modified" | "removed"; doc: QueryDocumentSnapshot }
export interface QuerySnapshot { docs: QueryDocumentSnapshot[]; size: number; empty: boolean; docChanges(): DocumentChange[]; metadata: { fromCache: boolean } }

export function getFirestore(opts: DbOptions = {}): Db {
  const name = opts.name ?? "localfire";
  const kv = opts.storage ?? (typeof localStorage !== "undefined" ? localStorage : memory());
  const mk = opts.channel ?? ((n: string) => (typeof BroadcastChannel !== "undefined" ? (new BroadcastChannel(n) as unknown as ChannelLike) : null));
  const chan = mk(name);
  const db: Db = { name, kv, chan, listeners: new Set(), tabId: Math.random().toString(36).slice(2), presence: new Map(), presenceListeners: new Set() };
  if (chan) {
    chan.onmessage = (e) => {
      const m = e.data;
      if (m.t === "change") db.listeners.forEach((l) => l());
      else if (m.t === "hello" || m.t === "ping") { db.presence.set(m.tab, Date.now()); if (m.t === "hello") chan.postMessage({ t: "ping", tab: db.tabId }); emitPresence(db); }
      else if (m.t === "bye") { db.presence.delete(m.tab); emitPresence(db); }
    };
    chan.postMessage({ t: "hello", tab: db.tabId });
  }
  return db;
}

function memory(): KV { const m: Record<string, string> = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; }
function emitPresence(db: Db) { const n = connectedTabs(db); db.presenceListeners.forEach((l) => l(n)); }
export const connectedTabs = (db: Db) => 1 + db.presence.size;
export function onPresence(db: Db, cb: (n: number) => void): () => void { db.presenceListeners.add(cb); cb(connectedTabs(db)); return () => db.presenceListeners.delete(cb); }
export function leave(db: Db) { db.chan?.postMessage({ t: "bye", tab: db.tabId }); db.chan?.close(); }

export const collection = (db: Db, path: string): CollectionRef => ({ type: "collection", db, path });
export const doc = (db: Db, path: string, id: string): DocRef => ({ type: "doc", db, path, id });
export const orderBy = (field: string, dir: "asc" | "desc" = "asc"): Constraint => ({ kind: "orderBy", field, dir });
export const where = (field: string, op: string, value: any): Constraint => ({ kind: "where", field, op, value });
export const query = (col: CollectionRef, ...constraints: Constraint[]): QueryRef => ({ type: "query", col, constraints });

const key = (db: Db, path: string) => `${db.name}:${path}`;
function load(db: Db, path: string): Record<string, Data> {
  try { return JSON.parse(db.kv.getItem(key(db, path)) || "{}"); } catch { return {}; }
}
function save(db: Db, path: string, data: Record<string, Data>) {
  db.kv.setItem(key(db, path), JSON.stringify(data));
  db.listeners.forEach((l) => l());
  db.chan?.postMessage({ t: "change", path });
}
const resolve = (v: Data): Data => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === TS ? Date.now() : x]));
let seq = 0;
const newId = () => Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);

export async function addDoc(col: CollectionRef, data: Data): Promise<DocRef> {
  const id = newId(); const all = load(col.db, col.path);
  all[id] = resolve(data); save(col.db, col.path, all);
  return doc(col.db, col.path, id);
}
export async function setDoc(ref: DocRef, data: Data) { const all = load(ref.db, ref.path); all[ref.id] = resolve(data); save(ref.db, ref.path, all); }
export async function updateDoc(ref: DocRef, data: Data) {
  const all = load(ref.db, ref.path);
  if (!all[ref.id]) throw new Error("not-found: o documento não existe mais.");
  all[ref.id] = { ...all[ref.id], ...resolve(data) }; save(ref.db, ref.path, all);
}
export async function deleteDoc(ref: DocRef) { const all = load(ref.db, ref.path); delete all[ref.id]; save(ref.db, ref.path, all); }

function match(d: Data, c: Constraint) {
  const a = d[c.field], b = c.value;
  switch (c.op) { case "==": return a === b; case "!=": return a !== b; case "<": return a < b; case "<=": return a <= b; case ">": return a > b; case ">=": return a >= b; default: return true; }
}
function run(q: QueryRef | CollectionRef): QueryDocumentSnapshot[] {
  const col = q.type === "query" ? q.col : q; const cs = q.type === "query" ? q.constraints : [];
  let rows = Object.entries(load(col.db, col.path)).map(([id, d]) => ({ id, d }));
  for (const c of cs) if (c.kind === "where") rows = rows.filter((r) => match(r.d, c));
  for (const c of [...cs].reverse()) if (c.kind === "orderBy") rows.sort((x, y) => (x.d[c.field] > y.d[c.field] ? 1 : x.d[c.field] < y.d[c.field] ? -1 : 0) * (c.dir === "desc" ? -1 : 1));
  return rows.map((r) => ({ id: r.id, ref: doc(col.db, col.path, r.id), data: () => ({ ...r.d }) }));
}

export function onSnapshot(q: QueryRef | CollectionRef, next: (s: QuerySnapshot) => void, error?: (e: Error) => void): () => void {
  const db = (q.type === "query" ? q.col : q).db;
  let prev = new Map<string, string>();
  const fire = () => {
    try {
      const docs = run(q); const cur = new Map(docs.map((d) => [d.id, JSON.stringify(d.data())]));
      const changes: DocumentChange[] = [];
      docs.forEach((d) => { if (!prev.has(d.id)) changes.push({ type: "added", doc: d }); else if (prev.get(d.id) !== cur.get(d.id)) changes.push({ type: "modified", doc: d }); });
      prev.forEach((_, id) => { if (!cur.has(id)) changes.push({ type: "removed", doc: { id, ref: doc(db, "", id), data: () => ({}) } }); });
      prev = cur;
      next({ docs, size: docs.length, empty: docs.length === 0, docChanges: () => changes, metadata: { fromCache: false } });
    } catch (e) { error?.(e as Error); }
  };
  db.listeners.add(fire);
  queueMicrotask(fire);
  return () => db.listeners.delete(fire);
}
