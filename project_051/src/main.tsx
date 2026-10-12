import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { STATUSES, Task, Priority, Status, createTask, filterTasks, isOverdue, loadTasks, moveTask, progress, sortTasks, validateTitle } from './logic';

const KEY = 'taskflow.tasks';
const prioStyle: Record<Priority, string> = { alta: 'bg-rose-100 text-rose-700', media: 'bg-amber-100 text-amber-800', baixa: 'bg-emerald-100 text-emerald-700' };
const today = () => new Date().toISOString().slice(0, 10);

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => { try { return loadTasks(localStorage); } catch { return []; } });
  const [query, setQuery] = useState('');
  const [prio, setPrio] = useState<Priority | 'todas'>('todas');
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [due, setDue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch { /* sem persistência */ } }, [tasks]);

  const visible = useMemo(() => sortTasks(filterTasks(tasks, { query, priority: prio })), [tasks, query, prio]);
  const pct = progress(tasks);

  function reset() { setEditing(null); setTitle(''); setNotes(''); setPriority('media'); setDue(''); setError(null); }
  function submit(e: FormEvent) {
    e.preventDefault();
    const err = validateTitle(title);
    if (err) { setError(err); titleRef.current?.focus(); return; }
    if (editing) setTasks(ts => ts.map(t => t.id === editing.id ? { ...t, title: title.trim(), notes: notes.trim(), priority, due } : t));
    else setTasks(ts => [...ts, createTask({ title, notes, priority, due })]);
    reset();
  }
  function edit(t: Task) { setEditing(t); setTitle(t.title); setNotes(t.notes); setPriority(t.priority); setDue(t.due); setError(null); titleRef.current?.focus(); }
  function remove(t: Task) { if (confirm(`Excluir "${t.title}"?`)) { setTasks(ts => ts.filter(x => x.id !== t.id)); if (editing?.id === t.id) reset(); } }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Task<span className="text-brand">Flow</span></h1>
          <p className="text-slate-600">Organize o fluxo do trabalho em três colunas.</p>
        </div>
        <div className="w-full sm:w-64" aria-label="Progresso geral">
          <div className="mb-1 flex justify-between text-sm font-semibold"><span>Progresso</span><span>{pct}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-mint transition-all" style={{ width: pct + '%' }} />
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-6" noValidate>
        <h2 className="text-lg font-bold sm:col-span-6">{editing ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <div className="sm:col-span-3">
          <label htmlFor="title" className="mb-1 block text-sm font-medium">Título</label>
          <input id="title" ref={titleRef} className="field" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'title-err' : undefined} placeholder="Ex.: Revisar proposta" />
          {error && <p id="title-err" role="alert" className="mt-1 text-sm text-rose-600">{error}</p>}
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="prio" className="mb-1 block text-sm font-medium">Prioridade</label>
          <select id="prio" className="field" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="due" className="mb-1 block text-sm font-medium">Prazo</label>
          <input id="due" type="date" className="field" value={due} onChange={e => setDue(e.target.value)} />
        </div>
        <div className="sm:col-span-6">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notas</label>
          <textarea id="notes" rows={2} className="field" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex gap-2 sm:col-span-6">
          <button className="btn btn-primary" type="submit">{editing ? 'Salvar alterações' : 'Adicionar tarefa'}</button>
          {editing && <button className="btn btn-ghost" type="button" onClick={reset}>Cancelar</button>}
        </div>
      </form>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-0 flex-1 basis-48">
          <label htmlFor="q" className="sr-only">Buscar tarefas</label>
          <input id="q" className="field" type="search" placeholder="Buscar tarefas…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div>
          <label htmlFor="fp" className="sr-only">Filtrar por prioridade</label>
          <select id="fp" className="field" value={prio} onChange={e => setPrio(e.target.value as Priority | 'todas')}>
            <option value="todas">Todas as prioridades</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-600">Nenhuma tarefa ainda. Crie a primeira no formulário acima.</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-600">Nenhuma tarefa corresponde aos filtros.</p>
      ) : null}

      {tasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {STATUSES.map(col => {
            const items = visible.filter(t => t.status === col.id);
            return (
              <section key={col.id} aria-labelledby={'c-' + col.id} className="rounded-2xl bg-slate-100/80 p-3">
                <h2 id={'c-' + col.id} className="mb-3 flex items-center justify-between px-1 text-sm font-extrabold uppercase tracking-wide text-slate-600">{col.label}<span className="rounded-full bg-white px-2 py-0.5 text-xs">{items.length}</span></h2>
                <ul className="space-y-3">
                  {items.map(t => (
                    <li key={t.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className={'break-words font-bold ' + (t.status === 'done' ? 'text-slate-400 line-through' : '')}>{t.title}</h3>
                        <span className={'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ' + prioStyle[t.priority]}>{t.priority}</span>
                      </div>
                      {t.notes && <p className="mb-1 break-words text-sm text-slate-600">{t.notes}</p>}
                      {t.due && <p className={'text-xs ' + (isOverdue(t, today()) ? 'font-bold text-rose-600' : 'text-slate-500')}>{isOverdue(t, today()) ? 'Atrasada · ' : 'Prazo · '}{t.due.split('-').reverse().join('/')}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={'m' + t.id}>Mover {t.title}</label>
                        <select id={'m' + t.id} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs" value={t.status} onChange={e => setTasks(ts => moveTask(ts, t.id, e.target.value as Status))}>
                          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <button className="rounded-md px-2 py-1 text-xs font-semibold text-brand underline" onClick={() => edit(t)}>Editar</button>
                        <button className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 underline" onClick={() => remove(t)}>Excluir</button>
                      </div>
                    </li>
                  ))}
                  {items.length === 0 && <li className="px-1 py-4 text-center text-sm text-slate-500">Vazio</li>}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
