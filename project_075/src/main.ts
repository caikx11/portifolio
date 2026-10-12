import { SIZES, VARIANTS, Size, Variant, accordion, alerts, badges, button, form, modal, tabs, toasts } from "./snippets";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const root = document.getElementById("app") as HTMLElement;

interface Sec { id: string; title: string; desc: string; code: () => string; controls?: string }
let variant: Variant = "primary", size: Size = "md", disabled = false;

const SECTIONS: Sec[] = [
  { id: "buttons", title: "Botões", desc: "Cinco variantes e três tamanhos. Ajuste e copie.", code: () => button(variant, size, disabled),
    controls: `<div class="mb-4 flex flex-wrap items-end gap-4 text-sm">
      <label class="font-bold">Variante<select data-ctl="variant" class="mt-1 block rounded-lg border-2 border-line bg-white px-2 py-1.5">${(Object.keys(VARIANTS) as Variant[]).map((v) => `<option ${v === variant ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label class="font-bold">Tamanho<select data-ctl="size" class="mt-1 block rounded-lg border-2 border-line bg-white px-2 py-1.5">${(Object.keys(SIZES) as Size[]).map((v) => `<option ${v === size ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label class="flex items-center gap-2 pb-1.5 font-bold"><input type="checkbox" data-ctl="disabled" class="h-4 w-4 accent-cobalt" ${disabled ? "checked" : ""}>Desabilitado</label></div>` },
  { id: "badges", title: "Badges", desc: "Rótulos de status compactos.", code: () => badges },
  { id: "alerts", title: "Alertas", desc: "Mensagens contextuais com role adequado.", code: () => alerts },
  { id: "modal", title: "Modal", desc: "Diálogo acessível: foco preso, Esc fecha, foco volta ao gatilho.", code: () => modal },
  { id: "tabs", title: "Tabs", desc: "Navegação por setas, Home e End.", code: () => tabs },
  { id: "toasts", title: "Toasts", desc: "Notificações temporárias em região aria-live.", code: () => toasts },
  { id: "accordion", title: "Accordion", desc: "Baseado em details/summary, sem JavaScript.", code: () => accordion },
  { id: "form", title: "Campos de formulário", desc: "Inputs com label, foco e estado de erro.", code: () => form },
];
let q = "";

function shell() {
  root.innerHTML = `
  <header class="py-8"><p class="font-mono text-xs font-semibold uppercase tracking-widest text-tang">Tailwind CSS · ${SECTIONS.length} componentes</p>
  <h1 class="mt-2 text-6xl font-black leading-none">Tinta <span class="text-cobalt">UI</span></h1>
  <p class="mt-3 max-w-xl text-lg text-ink/70">Componentes prontos para copiar. O que você vê é exatamente o HTML mostrado abaixo de cada prévia.</p>
  <label for="q" class="mt-5 block text-sm font-bold">Filtrar componentes</label>
  <input id="q" type="search" placeholder="ex.: modal, tabs…" class="mt-1 w-full max-w-sm rounded-xl border-2 border-line bg-white px-3.5 py-2.5 outline-none focus:border-cobalt"></header>
  <nav id="toc" aria-label="Componentes" class="mb-6 flex flex-wrap gap-2"></nav>
  <div id="secs" class="space-y-8"></div>`;
}

function list() { return SECTIONS.filter((s) => (s.title + s.desc).toLowerCase().includes(q.toLowerCase())); }

function renderToc() {
  (root.querySelector("#toc") as HTMLElement).innerHTML = list().map((s) => `<a href="#${s.id}" class="rounded-full bg-white px-3.5 py-1.5 text-sm font-bold ring-1 ring-line hover:bg-cobalt-soft">${s.title}</a>`).join("");
}

function renderSecs(only?: string) {
  const host = root.querySelector("#secs") as HTMLElement;
  const html = (s: Sec) => `<section id="${s.id}" data-sec="${s.id}" class="scroll-mt-20 rounded-2xl border border-line bg-white/60 p-5">
    <h2 class="text-3xl font-black">${s.title}</h2><p class="mb-4 text-ink/70">${s.desc}</p>
    ${s.controls ?? ""}
    <div data-preview class="rounded-xl border border-dashed border-line bg-white p-5">${s.code()}</div>
    <details class="mt-3"><summary class="cursor-pointer text-sm font-bold text-cobalt">Ver código</summary><pre class="mt-2 max-h-72 overflow-auto rounded-xl bg-ink p-4 font-mono text-xs leading-relaxed text-cream"><code>${esc(s.code())}</code></pre></details>
    <div class="mt-3 flex items-center gap-3"><button type="button" data-copy="${s.id}" class="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-cobalt">Copiar código</button><span data-status class="text-sm font-semibold text-emerald-700" role="status"></span></div></section>`;
  if (only) {
    const s = SECTIONS.find((x) => x.id === only) as Sec; const el = host.querySelector(`[data-sec="${only}"]`) as HTMLElement;
    el.querySelector("[data-preview]")!.innerHTML = s.code();
    el.querySelector("pre code")!.textContent = s.code();
    return;
  }
  const l = list();
  host.innerHTML = l.length ? l.map(html).join("") : `<div class="rounded-2xl border border-dashed border-line p-10 text-center text-ink/60">Nenhum componente corresponde a “${esc(q)}”.</div>`;
}

function toast(kind: string) {
  const map: Record<string, [string, string]> = { ok: ["bg-emerald-600", "Salvo com sucesso!"], info: ["bg-cobalt", "Nova versão disponível."], err: ["bg-tang", "Algo deu errado. Tente de novo."] };
  const [bg, msg] = map[kind];
  const el = document.createElement("div");
  el.className = `toast-in pointer-events-auto flex items-center justify-between gap-3 rounded-xl ${bg} px-4 py-3 text-sm font-bold text-white shadow-lg`;
  el.innerHTML = `<span>${msg}</span><button type="button" aria-label="Fechar aviso" class="rounded px-1.5 hover:bg-white/20">✕</button>`;
  el.querySelector("button")!.addEventListener("click", () => el.remove());
  document.getElementById("toast-host")!.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

let lastTrigger: HTMLElement | null = null;
function closeModal(m: HTMLElement) { m.hidden = true; lastTrigger?.focus(); }
function openModal(m: HTMLElement, trigger: HTMLElement) { lastTrigger = trigger; m.hidden = false; (m.querySelector("button") as HTMLElement).focus(); }

async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try { const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok; } catch { return false; }
  }
}

root.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement;
  const cp = t.closest<HTMLElement>("[data-copy]");
  if (cp) {
    const s = SECTIONS.find((x) => x.id === cp.dataset.copy) as Sec;
    const st = cp.parentElement!.querySelector("[data-status]") as HTMLElement;
    const ok = await copy(s.code());
    st.className = `text-sm font-semibold ${ok ? "text-emerald-700" : "text-red-700"}`;
    st.textContent = ok ? "Copiado!" : "Não foi possível copiar. Abra “Ver código” e copie manualmente.";
    setTimeout(() => (st.textContent = ""), 2500);
    return;
  }
  const mo = t.closest<HTMLElement>("[data-modal-open]");
  if (mo) { openModal(mo.parentElement!.querySelector("[data-modal]") as HTMLElement, mo); return; }
  const mc = t.closest<HTMLElement>("[data-modal-close]");
  if (mc) { closeModal(mc.closest("[data-modal]") as HTMLElement); return; }
  if (t.hasAttribute("data-modal")) { closeModal(t); return; }
  const ts = t.closest<HTMLElement>("[data-toast]");
  if (ts) { toast(ts.dataset.toast as string); return; }
  const tab = t.closest<HTMLElement>('[role="tab"]');
  if (tab) selectTab(tab);
});

function selectTab(tab: HTMLElement, focus = false) {
  const wrap = tab.closest("[data-tabs]") as HTMLElement;
  wrap.querySelectorAll<HTMLElement>('[role="tab"]').forEach((b) => { const on = b === tab; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; (wrap.querySelector("#" + b.getAttribute("aria-controls")) as HTMLElement).hidden = !on; });
  if (focus) tab.focus();
}

document.addEventListener("keydown", (e) => {
  const open = document.querySelector<HTMLElement>("[data-modal]:not([hidden])");
  if (open) {
    if (e.key === "Escape") closeModal(open);
    if (e.key === "Tab") {
      const f = [...open.querySelectorAll<HTMLElement>("button")]; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }
  const tab = (e.target as HTMLElement).closest?.('[role="tab"]') as HTMLElement | null;
  if (tab && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const all = [...(tab.closest('[role="tablist"]') as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')];
    const i = all.indexOf(tab);
    const n = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length;
    selectTab(all[n], true);
  }
});

root.addEventListener("change", (e) => {
  const c = e.target as HTMLInputElement | HTMLSelectElement; const k = c.dataset.ctl; if (!k) return;
  if (k === "variant") variant = c.value as Variant; else if (k === "size") size = c.value as Size; else disabled = (c as HTMLInputElement).checked;
  renderSecs("buttons");
});
root.addEventListener("input", (e) => { const t = e.target as HTMLInputElement; if (t.id === "q") { q = t.value; renderToc(); renderSecs(); } });

shell(); renderToc(); renderSecs();
