import { addDoc, collection, deleteDoc, doc, getFirestore, onPresence, onSnapshot, orderBy, query, serverTimestamp, updateDoc, leave } from "./firebase";

interface Item { id: string; text: string; done: boolean; createdAt: number }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const hasBC = typeof BroadcastChannel !== "undefined";

const db = getFirestore({ name: "brasa-lista" });
const col = collection(db, "itens");
let items: Item[] = [];
let filter: "all" | "open" | "done" = "all";
let tabs = 1;
let pendingLocal = 0;
let loaded = false;
let error = "";
const log: { t: string; msg: string; remote: boolean }[] = [];
const fresh = new Set<string>();

const root = document.getElementById("app") as HTMLElement;
root.innerHTML = `
<header class="py-8">
  <p class="font-mono text-xs uppercase tracking-widest text-amber">onSnapshot · BroadcastChannel</p>
  <h1 class="mt-2 text-5xl font-extrabold leading-none">Lista <span class="text-flame">ao vivo</span></h1>
  <p class="mt-3 text-bone/70">Abra esta página em duas abas: o que você adicionar, marcar ou apagar aparece nas duas, sem recarregar.</p>
  <div class="mt-4 flex flex-wrap items-center gap-3">
    <span id="presence" class="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1.5 font-mono text-xs" aria-live="polite"></span>
    <button id="open2" class="btn-line">Abrir 2ª aba</button>
  </div>
  <p id="nobc" class="mt-3 hidden rounded-xl border border-flame bg-flame/10 px-3 py-2 text-sm">Este navegador não tem BroadcastChannel: a lista funciona, mas não sincroniza entre abas.</p>
</header>
<form id="form" class="flex gap-2" novalidate>
  <label for="txt" class="sr-only">Novo item</label>
  <input id="txt" autocomplete="off" maxlength="80" placeholder="Ex.: pão, café, leite…" class="min-w-0 flex-1 rounded-xl border border-edge bg-panel px-4 py-3 text-base outline-none focus:border-amber">
  <button class="btn-amber">Adicionar</button>
</form>
<p id="err" role="alert" class="mt-2 hidden text-sm text-flame"></p>
<div class="mt-5 flex items-center justify-between gap-2">
  <div id="filters" class="flex gap-1.5" role="group" aria-label="Filtro"></div>
  <button id="clear" class="btn-line text-xs">Limpar concluídos</button>
</div>
<ul id="list" class="mt-3 space-y-2"></ul>
<section class="mt-10"><h2 class="font-mono text-xs uppercase tracking-widest text-sync">Eventos do snapshot</h2><ol id="log" class="mt-2 space-y-1 font-mono text-xs text-bone/70"></ol></section>`;

const $ = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;
if (!hasBC) $("#nobc").classList.remove("hidden");

function render() {
  $("#presence").innerHTML = `<span class="pulse h-2 w-2 rounded-full bg-sync"></span>${tabs} ${tabs === 1 ? "aba conectada" : "abas conectadas"}`;
  const labels: [typeof filter, string][] = [["all", "Todos"], ["open", "Abertos"], ["done", "Feitos"]];
  $("#filters").innerHTML = labels.map(([k, l]) => `<button data-f="${k}" aria-pressed="${filter === k}" class="btn ${filter === k ? "bg-amber text-coal" : "border border-edge bg-panel"}">${l}</button>`).join("");
  const shown = items.filter((i) => (filter === "all" ? true : filter === "done" ? i.done : !i.done));
  const list = $("#list");
  if (!loaded) list.innerHTML = `<li class="rounded-xl border border-edge p-5 text-center text-bone/60">Conectando…</li>`;
  else if (error) list.innerHTML = `<li role="alert" class="rounded-xl border border-flame bg-flame/10 p-5 text-center">${esc(error)}</li>`;
  else if (!shown.length) list.innerHTML = `<li class="rounded-xl border border-dashed border-edge p-8 text-center text-bone/60">${items.length ? "Nenhum item neste filtro." : "Lista vazia. Adicione o primeiro item acima."}</li>`;
  else list.innerHTML = shown.map((i) => `<li class="${fresh.has(i.id) ? "flash " : ""}flex items-center gap-3 rounded-xl border border-edge bg-panel px-3 py-2.5">
    <input type="checkbox" data-id="${i.id}" ${i.done ? "checked" : ""} aria-label="Concluir ${esc(i.text)}" class="h-5 w-5 accent-amber">
    <span class="min-w-0 flex-1 break-words ${i.done ? "text-bone/40 line-through" : ""}">${esc(i.text)}</span>
    <button data-del="${i.id}" class="btn-line px-3 py-1.5 text-xs" aria-label="Apagar ${esc(i.text)}">Apagar</button></li>`).join("");
  $("#log").innerHTML = log.length ? log.map((l) => `<li><span class="${l.remote ? "text-sync" : "text-amber"}">${l.remote ? "outra aba" : "esta aba "}</span> ${l.t} ${esc(l.msg)}</li>`).join("") : `<li>Aguardando eventos…</li>`;
}

onSnapshot(query(col, orderBy("createdAt", "desc")), (snap) => {
  items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, "id">) }));
  const ch = snap.docChanges();
  const remote = pendingLocal === 0;
  if (pendingLocal > 0) pendingLocal--;
  fresh.clear();
  if (loaded) ch.forEach((c) => {
    if (c.type === "added" && remote) fresh.add(c.doc.id);
    const txt = c.type === "removed" ? c.doc.id.slice(0, 6) : (c.doc.data().text as string);
    log.unshift({ t: new Date().toLocaleTimeString("pt-BR"), msg: `${{ added: "+", modified: "~", removed: "−" }[c.type]} ${txt}`, remote });
  });
  log.length = Math.min(log.length, 8);
  loaded = true; error = ""; render();
}, (e) => { error = "Erro ao ler a lista: " + e.message; loaded = true; render(); });

onPresence(db, (n) => { tabs = n; render(); });

async function run(fn: () => Promise<unknown>) {
  pendingLocal++;
  try { await fn(); $("#err").classList.add("hidden"); } catch (e) { pendingLocal = Math.max(0, pendingLocal - 1); const m = $("#err"); m.textContent = (e as Error).message; m.classList.remove("hidden"); }
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = $<HTMLInputElement>("#txt"); const text = inp.value.trim();
  const m = $("#err");
  if (!text) { m.textContent = "Digite o nome do item antes de adicionar."; m.classList.remove("hidden"); inp.focus(); return; }
  inp.value = "";
  run(() => addDoc(col, { text, done: false, createdAt: serverTimestamp() }));
});
$("#list").addEventListener("click", (e) => {
  const id = (e.target as HTMLElement).closest<HTMLElement>("[data-del]")?.dataset.del;
  if (id) run(() => deleteDoc(doc(db, "itens", id)));
});
$("#list").addEventListener("change", (e) => {
  const t = e.target as HTMLInputElement; if (t.dataset.id) run(() => updateDoc(doc(db, "itens", t.dataset.id as string), { done: t.checked }));
});
$("#filters").addEventListener("click", (e) => { const f = (e.target as HTMLElement).closest<HTMLElement>("[data-f]")?.dataset.f; if (f) { filter = f as typeof filter; render(); } });
$("#clear").addEventListener("click", () => { items.filter((i) => i.done).forEach((i) => run(() => deleteDoc(doc(db, "itens", i.id)))); });
$("#open2").addEventListener("click", () => window.open(location.href, "_blank"));
addEventListener("pagehide", () => leave(db));
render();
