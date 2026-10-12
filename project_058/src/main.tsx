import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { DEFAULTS, Mode, Settings, addFocus, dayKey, durationOf, formatTime, lastDays, nextMode, progress, remainingSec, sanitize } from "./timer";

interface Task { id: string; text: string; done: boolean; pomos: number }
interface Saved { settings: Settings; mode: Mode; completed: number; endAt: number | null; left: number; tasks: Task[]; active: string | null; history: Record<string, number> }
const KEY = "p058-state";
const LABEL: Record<Mode, string> = { focus: "Foco", short: "Pausa curta", long: "Pausa longa" };

function load(): Saved {
  const base: Saved = { settings: DEFAULTS, mode: "focus", completed: 0, endAt: null, left: DEFAULTS.focus * 60, tasks: [], active: null, history: {} };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && typeof v === "object") {
      const settings = sanitize(v.settings);
      const mode: Mode = ["focus", "short", "long"].includes(v.mode) ? v.mode : "focus";
      return { ...base, ...v, settings, mode, tasks: Array.isArray(v.tasks) ? v.tasks : [], history: v.history && typeof v.history === "object" ? v.history : {},
        left: typeof v.left === "number" ? v.left : durationOf(mode, settings), endAt: typeof v.endAt === "number" ? v.endAt : null };
    }
  } catch { /* ignore */ }
  return base;
}
function beep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const c = new Ctx(); const o = c.createOscillator(); const g = c.createGain();
    o.connect(g); g.connect(c.destination); o.frequency.value = 660; g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8); o.start(); o.stop(c.currentTime + 0.8);
  } catch { /* no audio */ }
}

function App() {
  const init = useRef(load()).current;
  const [settings, setSettings] = useState(init.settings);
  const [mode, setMode] = useState<Mode>(init.mode);
  const [completed, setCompleted] = useState(init.completed);
  const [endAt, setEndAt] = useState<number | null>(init.endAt);
  const [left, setLeft] = useState(init.endAt ? remainingSec(init.endAt, Date.now()) : init.left);
  const [tasks, setTasks] = useState<Task[]>(init.tasks);
  const [active, setActive] = useState<string | null>(init.active);
  const [history, setHistory] = useState(init.history);
  const [draft, setDraft] = useState("");
  const [showCfg, setShowCfg] = useState(false);
  const [notice, setNotice] = useState("");
  const running = endAt !== null;
  const total = durationOf(mode, settings);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ settings, mode, completed, endAt, left, tasks, active, history })); } catch { /* quota */ }
  }, [settings, mode, completed, endAt, left, tasks, active, history]);

  const finish = () => {
    beep();
    let c = completed;
    if (mode === "focus") {
      c = completed + 1; setCompleted(c);
      setHistory((h) => addFocus(h, dayKey(new Date()), settings.focus));
      if (active) setTasks((t) => t.map((x) => (x.id === active ? { ...x, pomos: x.pomos + 1 } : x)));
    }
    const nm = nextMode(mode, c, settings.longEvery);
    setNotice(mode === "focus" ? `Sessão concluída! Hora de: ${LABEL[nm].toLowerCase()}.` : "Pausa encerrada. Pronto para focar?");
    setMode(nm); setEndAt(null); setLeft(durationOf(nm, settings));
  };

  useEffect(() => {
    if (!running) return;
    const tick = () => { const r = remainingSec(endAt!, Date.now()); setLeft(r); if (r <= 0) finish(); };
    const id = setInterval(tick, 250); tick();
    return () => clearInterval(id);
  }, [endAt, mode, settings, active, completed]);

  useEffect(() => { document.title = running ? `${formatTime(left)} · ${LABEL[mode]}` : "Foco Pomodoro"; }, [left, running, mode]);

  const start = () => { setNotice(""); setEndAt(Date.now() + left * 1000); };
  const pause = () => { if (endAt) setLeft(remainingSec(endAt, Date.now())); setEndAt(null); };
  const reset = () => { setEndAt(null); setLeft(total); setNotice(""); };
  const pick = (m: Mode) => { setMode(m); setEndAt(null); setLeft(durationOf(m, settings)); setNotice(""); };
  const setCfg = (k: keyof Settings, v: string) => {
    const s = sanitize({ ...settings, [k]: Number(v) }); setSettings(s);
    if (!running && k === mode) setLeft(durationOf(mode, s));
  };
  const addTask = (e: React.FormEvent) => {
    e.preventDefault(); const t = draft.trim(); if (!t) return;
    const id = Math.random().toString(36).slice(2, 8);
    setTasks([...tasks, { id, text: t, done: false, pomos: 0 }]); if (!active) setActive(id); setDraft("");
  };

  const R = 110, C = 2 * Math.PI * R;
  const days = lastDays(history, 7, new Date());
  const max = Math.max(60, ...days.map((d) => d.minutes));
  const todayMin = days[6].minutes;
  const activeTask = tasks.find((t) => t.id === active);

  return (
    <div className={"page m-" + mode}>
      <header><h1>Foco<span>.</span></h1><p>Pomodoro com tarefas e estatísticas</p></header>
      <main className="grid">
        <section className="timer" aria-label="Cronômetro">
          <div className="modes" role="tablist">
            {(["focus", "short", "long"] as Mode[]).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => pick(m)}>{LABEL[m]}</button>
            ))}
          </div>
          <div className="dial">
            <svg viewBox="0 0 260 260" aria-hidden="true">
              <circle cx="130" cy="130" r={R} className="track" />
              <circle cx="130" cy="130" r={R} className="bar" strokeDasharray={C} strokeDashoffset={C * (1 - progress(left, total))} transform="rotate(-90 130 130)" />
            </svg>
            <div className="time" role="timer" aria-label={`${formatTime(left)} restantes`}>{formatTime(left)}<small>{activeTask && mode === "focus" ? activeTask.text : LABEL[mode]}</small></div>
          </div>
          <div className="ctrl">
            {running ? <button className="big" onClick={pause}>Pausar</button> : <button className="big" onClick={start}>{left < total ? "Continuar" : "Iniciar"}</button>}
            <button onClick={reset}>Reiniciar</button>
            <button onClick={finish} title="Pular para a próxima etapa">Pular</button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          <p className="cycle">Ciclo: {completed % settings.longEvery}/{settings.longEvery} · {completed} sessões totais</p>
          <button className="link" aria-expanded={showCfg} onClick={() => setShowCfg(!showCfg)}>Ajustes</button>
          {showCfg && (
            <div className="cfg">
              {([["focus", "Foco (min)"], ["short", "Pausa curta"], ["long", "Pausa longa"], ["longEvery", "Longa a cada"]] as [keyof Settings, string][]).map(([k, l]) => (
                <label key={k}>{l}<input type="number" min={k === "longEvery" ? 2 : 1} max={k === "longEvery" ? 10 : 120} value={settings[k]} onChange={(e) => setCfg(k, e.target.value)} /></label>
              ))}
            </div>
          )}
        </section>
        <section className="side">
          <div className="card">
            <h2>Tarefas</h2>
            <form onSubmit={addTask}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="No que vai focar?" aria-label="Nova tarefa" /><button>Adicionar</button></form>
            {tasks.length === 0 ? <p className="empty">Sem tarefas. Adicione uma para vincular suas sessões.</p> : (
              <ul className="tasks">
                {tasks.map((t) => (
                  <li key={t.id} className={(t.id === active ? "on " : "") + (t.done ? "done" : "")}>
                    <input type="checkbox" checked={t.done} aria-label={`Concluir ${t.text}`} onChange={() => setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))} />
                    <button className="pick" onClick={() => setActive(t.id)} aria-pressed={t.id === active}>{t.text}</button>
                    <span className="pomos">🍅 {t.pomos}</span>
                    <button className="del" aria-label={`Remover ${t.text}`} onClick={() => { setTasks(tasks.filter((x) => x.id !== t.id)); if (active === t.id) setActive(null); }}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h2>Últimos 7 dias</h2>
            <p className="today">Hoje: <b>{todayMin} min</b> de foco</p>
            <div className="chart" role="img" aria-label={"Minutos de foco: " + days.map((d) => `${d.key.slice(5)} ${d.minutes}`).join(", ")}>
              {days.map((d) => (
                <div key={d.key} className="col"><div className="b" style={{ height: `${(d.minutes / max) * 100}%` }} title={`${d.minutes} min`} /><span>{d.key.slice(8)}</span></div>
              ))}
            </div>
            {Object.keys(history).length === 0 && <p className="empty">Complete uma sessão de foco para ver o gráfico.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
