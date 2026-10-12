import { REGISTRY, Entry } from "./registry";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const show = (v: unknown): string => { if (v === undefined) return "undefined"; if (typeof v === "number" && Number.isNaN(v)) return "NaN"; try { return JSON.stringify(v, null, 2); } catch { return String(v); } };
const root = document.getElementById("app") as HTMLElement;
let selected: Entry = REGISTRY[0];
let q = "";
let result: { ok: boolean; text: string; ms: number } | null = null;
let suite: { name: string; ok: boolean; got: string }[] | null = null;

root.innerHTML = `
<header class="py-8"><p class="font-mono text-xs uppercase tracking-widest text-sig">tsc · jest · ${REGISTRY.length} funções</p>
<h1 class="mt-2 text-5xl font-extrabold leading-none">Planta <span class="text-cyan">TS</span></h1>
<p class="mt-3 max-w-2xl text-chalk/75">Utilitários tipados que você pode executar aqui. Os mesmos exemplos rodam no Jest (<code class="font-mono">npm test</code>). Argumentos são uma lista JSON.</p></header>
<div class="grid gap-5 md:grid-cols-[17rem_1fr]">
  <aside><label for="search" class="mb-1 block text-sm font-semibold">Buscar função</label>
  <input id="search" type="search" placeholder="ex.: slug, chunk…" class="w-full rounded-md border border-cyan/40 bg-blue-900 px-3 py-2 outline-none focus:border-sig">
  <nav id="nav" aria-label="Funções" class="mt-3 max-h-[60vh] overflow-auto"></nav></aside>
  <section id="panel" aria-live="polite"></section>
</div>`;
const $ = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;

function renderNav() {
  const list = REGISTRY.filter((e) => (e.name + e.category + e.doc).toLowerCase().includes(q.toLowerCase()));
  if (!list.length) { $("#nav").innerHTML = `<p class="rounded-md border border-dashed border-cyan/40 p-4 text-sm text-chalk/70">Nenhuma função encontrada para “${esc(q)}”.</p>`; return; }
  const cats = [...new Set(list.map((e) => e.category))];
  $("#nav").innerHTML = cats.map((c) => `<h2 class="mb-1 mt-3 font-mono text-xs uppercase tracking-widest text-cyan">${c}</h2>` + list.filter((e) => e.category === c).map((e) =>
    `<button data-n="${e.name}" aria-current="${e === selected}" class="mb-1 block w-full rounded-md px-3 py-1.5 text-left font-mono text-sm ${e === selected ? "bg-sig text-blue-950 font-semibold" : "hover:bg-blue-800"}">${e.name}</button>`).join("")).join("");
}

function renderPanel() {
  const e = selected;
  $("#panel").innerHTML = `
  <article class="rounded-lg border border-cyan/30 bg-blue-900/70 p-5">
    <p class="font-mono text-xs uppercase tracking-widest text-cyan">${e.category}</p>
    <h2 class="font-mono text-3xl font-semibold">${e.name}</h2>
    <p class="mt-2 text-chalk/80">${esc(e.doc)}</p>
    <pre class="code mt-3 overflow-x-auto whitespace-pre-wrap break-words text-cyan">${esc(e.sig)}</pre>
    <label for="args" class="mb-1 mt-5 block text-sm font-semibold">Argumentos (lista JSON)</label>
    <textarea id="args" rows="3" spellcheck="false" class="code w-full outline-none focus:border-sig">${esc(e.argHint)}</textarea>
    <div class="mt-3 flex flex-wrap gap-2"><button id="run" class="btn-sig">Executar</button><button id="reset" class="btn-line">Restaurar exemplo</button></div>
    <div id="out" class="mt-4"></div>
  </article>
  <article class="mt-5 rounded-lg border border-cyan/30 bg-blue-900/70 p-5">
    <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="text-lg font-extrabold">Testes de exemplo</h3><button id="suite" class="btn-line">Rodar testes de ${e.name}</button></div>
    <div id="suite-out" class="mt-3 text-sm text-chalk/70">Nenhum teste rodado ainda.</div>
  </article>`;
  renderOut(); renderSuite();
}

function renderOut() {
  const o = $("#out");
  if (!result) { o.innerHTML = `<p class="text-sm text-chalk/60">O resultado aparece aqui.</p>`; return; }
  o.innerHTML = `<p class="mb-1 font-mono text-xs ${result.ok ? "text-ok" : "text-bad"}">${result.ok ? `RESULTADO · ${result.ms.toFixed(2)} ms` : "ERRO"}</p><pre role="${result.ok ? "status" : "alert"}" class="code overflow-x-auto whitespace-pre-wrap break-words ${result.ok ? "" : "border-bad text-bad"}">${esc(result.text)}</pre>`;
}
function renderSuite() {
  const s = $("#suite-out");
  if (!suite) { s.textContent = "Nenhum teste rodado ainda."; return; }
  s.innerHTML = `<ul class="space-y-1.5">${suite.map((t) => `<li class="code py-2 ${t.ok ? "" : "border-bad"}"><span class="${t.ok ? "text-ok" : "text-bad"}">${t.ok ? "PASS" : "FAIL"}</span> ${esc(t.name)}${t.ok ? "" : `<br><span class="text-bad">obtido: ${esc(t.got)}</span>`}</li>`).join("")}</ul>`;
}

function exec() {
  const raw = ($("#args") as HTMLTextAreaElement).value;
  let args: unknown;
  try { args = JSON.parse(raw); } catch (err) { result = { ok: false, text: "JSON inválido: " + (err as Error).message, ms: 0 }; renderOut(); return; }
  if (!Array.isArray(args)) { result = { ok: false, text: "Os argumentos devem ser uma lista JSON, ex.: [1, 2].", ms: 0 }; renderOut(); return; }
  const t0 = performance.now();
  try { const r = selected.fn(...args); result = { ok: true, text: show(r), ms: performance.now() - t0 }; }
  catch (err) { result = { ok: false, text: `${(err as Error).name}: ${(err as Error).message}`, ms: 0 }; }
  renderOut();
}

function runSuite() {
  suite = selected.examples.map((ex) => {
    const label = `${selected.name}(${ex.args.map((a) => JSON.stringify(a)).join(", ")}) → ${show(ex.expected).replace(/\s+/g, " ")}`;
    try { const got = selected.fn(...ex.args); return { name: label, ok: JSON.stringify(got) === JSON.stringify(ex.expected), got: show(got) }; }
    catch (err) { return { name: label, ok: false, got: (err as Error).message }; }
  });
  renderSuite();
}

$("#search").addEventListener("input", (e) => { q = (e.target as HTMLInputElement).value; renderNav(); });
$("#nav").addEventListener("click", (e) => {
  const n = (e.target as HTMLElement).closest<HTMLElement>("[data-n]")?.dataset.n;
  const f = REGISTRY.find((x) => x.name === n); if (f) { selected = f; result = null; suite = null; renderNav(); renderPanel(); }
});
$("#panel").addEventListener("click", (e) => {
  const id = (e.target as HTMLElement).closest("button")?.id;
  if (id === "run") exec(); else if (id === "suite") runSuite(); else if (id === "reset") { ($("#args") as HTMLTextAreaElement).value = selected.argHint; result = null; renderOut(); }
});
$("#panel").addEventListener("keydown", (e) => { const k = e as KeyboardEvent; if ((k.ctrlKey || k.metaKey) && k.key === "Enter") exec(); });
renderNav(); renderPanel();
