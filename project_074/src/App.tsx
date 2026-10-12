import { Fragment, useEffect, useRef, useState } from "react";
import { AGENTS, Agent, Step, answer, plan } from "./sim";

interface Msg { id: number; role: "user" | "assistant"; text: string; steps?: (Step & { status: "run" | "ok" | "err" })[]; done?: boolean; agent?: string }
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const delay = (ms: number) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));

function Rich({ text }: { text: string }) {
  const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^```(\w*)\n([\s\S]*?)```$/.exec(p);
        if (m) return <pre key={i} className="my-2 overflow-x-auto rounded-lg border border-edge bg-ink p-3 font-mono text-xs text-sky"><code>{m[2]}</code></pre>;
        return <Fragment key={i}>{p.split(/(`[^`]+`|_[^_]+_)/g).map((s, j) => s.startsWith("`") ? <code key={j} className="rounded bg-ink px-1 font-mono text-[0.85em] text-rose">{s.slice(1, -1)}</code> : s.startsWith("_") && s.endsWith("_") && s.length > 2 ? <em key={j} className="text-sand/60">{s.slice(1, -1)}</em> : <span key={j} className="whitespace-pre-wrap">{s}</span>)}</Fragment>;
      })}
    </>
  );
}

export function App() {
  const [agent, setAgent] = useState<Agent>(AGENTS[0]);
  const [enabled, setEnabled] = useState<Record<string, Set<string>>>(() => Object.fromEntries(AGENTS.map((a) => [a.id, new Set(a.tools.map((t) => t.id))])));
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const stop = useRef(false);
  const idc = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const list = msgs[agent.id] ?? [];
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end", behavior: reduced() ? "auto" : "smooth" }); }, [list, agent]);

  const patch = (aid: string, id: number, f: (m: Msg) => Msg) => setMsgs((s) => ({ ...s, [aid]: (s[aid] ?? []).map((m) => (m.id === id ? f(m) : m)) }));

  async function send(text: string) {
    const t = text.trim();
    if (!t) { setErr("Escreva uma pergunta antes de enviar."); return; }
    if (busy) return;
    setErr(""); setInput(""); setBusy(true); stop.current = false;
    const aid = agent.id, a = agent;
    const uid = idc.current++, rid = idc.current++;
    const steps = plan(a, enabled[aid], t);
    setMsgs((s) => ({ ...s, [aid]: [...(s[aid] ?? []), { id: uid, role: "user", text: t }, { id: rid, role: "assistant", text: "", steps: steps.map((x) => ({ ...x, status: "run" as const })), agent: a.name }] }));
    let failed = false;
    for (let i = 0; i < steps.length; i++) {
      await delay(700);
      if (stop.current) break;
      const bad = !!steps[i].fail; failed = failed || bad;
      patch(aid, rid, (m) => ({ ...m, steps: m.steps!.map((x, k) => (k === i ? { ...x, status: bad ? "err" : "ok" } : x)) }));
      if (bad) break;
    }
    if (stop.current) { patch(aid, rid, (m) => ({ ...m, text: "_Execução interrompida por você._", done: true })); setBusy(false); return; }
    if (failed) { patch(aid, rid, (m) => ({ ...m, text: "Uma ferramenta falhou, então não consegui concluir. Tente novamente ou desative a ferramenta com falha.", done: true })); setBusy(false); return; }
    const full = answer(a, steps, t); const words = full.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 3) {
      if (stop.current) break;
      const part = words.slice(0, i + 3).join("");
      patch(aid, rid, (m) => ({ ...m, text: part }));
      await delay(30);
    }
    patch(aid, rid, (m) => ({ ...m, text: full, done: true }));
    setBusy(false);
  }

  const toggle = (id: string) => setEnabled((s) => { const n = new Set(s[agent.id]); n.has(id) ? n.delete(id) : n.add(id); return { ...s, [agent.id]: n }; });

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-3 pb-3">
      <div role="note" className="mb-3 rounded-lg border border-rose bg-rose/10 px-3 py-2 text-center text-sm font-semibold">
        DEMONSTRAÇÃO · As respostas são SIMULADAS no seu navegador. Nenhuma API de IA é chamada e nada sai desta página.
      </div>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[16rem_1fr]">
        <aside className="flex flex-col gap-3 overflow-auto md:pr-1">
          <h1 className="text-3xl font-extrabold leading-none">Ofi<span className="text-rose">cina</span></h1>
          <div role="tablist" aria-label="Agentes" className="flex gap-2 overflow-x-auto md:flex-col">
            {AGENTS.map((a) => (
              <button key={a.id} role="tab" aria-selected={a.id === agent.id} disabled={busy && a.id !== agent.id} onClick={() => { setAgent(a); setErr(""); }} className={`shrink-0 rounded-xl border px-3 py-2 text-left disabled:opacity-50 ${a.id === agent.id ? "border-rose bg-rose/10" : "border-edge bg-panel hover:border-sky"}`}>
                <span className="font-bold">{a.emoji} {a.name}</span><span className="hidden text-xs text-sand/60 md:block">{a.blurb}</span>
              </button>
            ))}
          </div>
          <fieldset className="hidden rounded-xl border border-edge bg-panel p-3 md:block">
            <legend className="px-1 font-mono text-xs uppercase tracking-widest text-sky">Ferramentas</legend>
            {agent.tools.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-start gap-2 py-1 text-sm"><input type="checkbox" className="mt-1 accent-rose" checked={enabled[agent.id].has(t.id)} disabled={busy} onChange={() => toggle(t.id)} /><span><span className="font-mono">{t.label}</span><br /><span className="text-xs text-sand/60">{t.desc}</span></span></label>
            ))}
          </fieldset>
        </aside>
        <section className="flex min-h-0 flex-col rounded-xl border border-edge bg-panel" aria-label={`Conversa com ${agent.name}`}>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {list.length === 0 && (
              <div className="m-auto max-w-md py-10 text-center">
                <p className="text-4xl">{agent.emoji}</p>
                <h2 className="mt-2 text-xl font-bold">{agent.name}</h2>
                <p className="text-sm text-sand/70">{agent.blurb} Comece com uma sugestão ou escreva a sua. Dica: inclua <code className="font-mono text-rose">/erro</code> para simular falha de ferramenta.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">{agent.prompts.map((p) => <button key={p} className="btn-line text-left" onClick={() => send(p)}>{p}</button>)}</div>
              </div>
            )}
            {list.map((m) => m.role === "user" ? (
              <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-sky/20 px-3.5 py-2 text-sm"><Rich text={m.text} /></div>
            ) : (
              <div key={m.id} className="max-w-[92%] rounded-2xl rounded-bl-sm border border-edge bg-ink px-3.5 py-2.5 text-sm">
                <p className="mb-1.5 flex items-center gap-2 font-mono text-xs text-sky">{agent.emoji} {m.agent}<span className="rounded bg-rose px-1.5 py-0.5 font-bold text-ink">SIMULADO</span></p>
                {m.steps && m.steps.length > 0 && <ul className="mb-2 space-y-1">{m.steps.map((s, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-x-2 rounded-md bg-panel px-2 py-1 font-mono text-xs">
                    <span aria-hidden className={s.status === "run" ? "spin inline-block h-3 w-3 rounded-full border-2 border-sky border-t-transparent" : s.status === "ok" ? "text-ok" : "text-rose"}>{s.status === "run" ? "" : s.status === "ok" ? "✓" : "✕"}</span>
                    <span className="sr-only">{s.status === "run" ? "executando" : s.status === "ok" ? "concluído" : "falhou"}</span>
                    <b>{s.tool.label}</b><span className="text-sand/50">{s.arg}</span>{s.status !== "run" && <span className={s.status === "err" ? "text-rose" : "text-sand/70"}>→ {s.result}</span>}
                  </li>))}</ul>}
                {m.text ? <Rich text={m.text} /> : <span className="text-sand/50">Pensando<span className="blink">…</span></span>}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="border-t border-edge p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            {err && <p role="alert" className="mb-2 text-sm text-rose">{err}</p>}
            <div className="flex gap-2">
              <label htmlFor="msg" className="sr-only">Mensagem</label>
              <textarea id="msg" rows={2} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Pergunte algo (Enter envia, Shift+Enter quebra linha)" className="min-w-0 flex-1 resize-none rounded-lg border border-edge bg-ink px-3 py-2 text-sm outline-none focus:border-sky" />
              {busy ? <button type="button" className="btn-line" onClick={() => { stop.current = true; }}>Parar</button> : <button className="btn-rose">Enviar</button>}
            </div>
            <div className="mt-2 flex justify-between text-xs text-sand/50"><span>{agent.tools.filter((t) => enabled[agent.id].has(t.id)).length} de {agent.tools.length} ferramentas ativas</span>{list.length > 0 && !busy && <button type="button" className="underline" onClick={() => setMsgs((s) => ({ ...s, [agent.id]: [] }))}>Limpar conversa</button>}</div>
          </form>
        </section>
      </div>
    </div>
  );
}
