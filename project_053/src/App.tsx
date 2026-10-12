import { FormEvent, useEffect, useState } from 'react';
import { Habit, STAGE_NAMES, Stage, createHabit, dateKey, loadHabits, stage, streak, toggleCheck, validateName, weekDays, weekDone } from './logic';

const KEY = 'habitgarden.habits';
const EMOJIS = ['🌱', '📚', '🏃', '💧', '🧘', '✍️', '🎸', '🥗'];
const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function Plant({ stage: s, label }: { stage: Stage; label?: string }) {
  return (
    <svg viewBox="0 0 80 90" width="64" height="72" role="img" aria-label={label ?? STAGE_NAMES[s]}>
      <ellipse cx="40" cy="80" rx="26" ry="7" fill="#5b3a29" />
      {s === 0 && <circle cx="40" cy="72" r="5" fill="#a47148" />}
      {s >= 1 && <path d={`M40 76 V${s === 1 ? 58 : s === 2 ? 44 : 30}`} stroke="#4f8a3c" strokeWidth="4" strokeLinecap="round" />}
      {s >= 1 && <ellipse cx="33" cy="60" rx="8" ry="4" fill="#7cc15a" transform="rotate(-30 33 60)" />}
      {s >= 2 && <ellipse cx="48" cy="52" rx="9" ry="4.5" fill="#8fd16a" transform="rotate(30 48 52)" />}
      {s >= 3 && <><ellipse cx="30" cy="42" rx="10" ry="5" fill="#6bb04b" transform="rotate(-25 30 42)" /><ellipse cx="50" cy="38" rx="11" ry="5" fill="#7cc15a" transform="rotate(25 50 38)" /></>}
      {s >= 4 && <g transform="translate(40 24)">{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-9" rx="5" ry="8" fill="#ff8fa3" transform={`rotate(${a})`} />)}<circle r="5" fill="#ffd166" /></g>}
    </svg>
  );
}

export default function App({ today: todayProp }: { today?: string }) {
  const today = todayProp ?? dateKey(new Date());
  const [habits, setHabits] = useState<Habit[]>(() => { try { return loadHabits(localStorage.getItem(KEY)); } catch { return []; } });
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [target, setTarget] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(habits)); } catch { /* ignore */ } }, [habits]);

  function add(e: FormEvent) {
    e.preventDefault();
    const err = validateName(name, habits);
    if (err) { setError(err); return; }
    setHabits(hs => [...hs, createHabit(name, emoji, target, today)]);
    setName(''); setError(null);
  }
  const toggle = (id: string, day: string) => setHabits(hs => hs.map(h => (h.id === id ? toggleCheck(h, day) : h)));
  const remove = (h: Habit) => { if (window.confirm(`Arrancar "${h.name}" do jardim?`)) setHabits(hs => hs.filter(x => x.id !== h.id)); };
  const days = weekDays(today);
  const doneToday = habits.filter(h => h.checks.includes(today)).length;

  return (
    <main className="wrap">
      <header className="hero">
        <h1>Habit Garden</h1>
        <p>Cada dia cumprido faz sua planta crescer.</p>
        {habits.length > 0 && <p className="today" role="status">Hoje: {doneToday} de {habits.length} regados</p>}
      </header>

      <form className="card add" onSubmit={add} noValidate>
        <h2>Plantar novo hábito</h2>
        <label htmlFor="hname">Nome do hábito</label>
        <input id="hname" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Ler 20 minutos" aria-invalid={!!error} aria-describedby={error ? 'herr' : undefined} />
        {error && <p id="herr" className="err" role="alert">{error}</p>}
        <fieldset><legend>Ícone</legend>
          <div className="emojis">{EMOJIS.map(e => <button type="button" key={e} className={e === emoji ? 'em on' : 'em'} aria-pressed={e === emoji} aria-label={`Ícone ${e}`} onClick={() => setEmoji(e)}>{e}</button>)}</div>
        </fieldset>
        <label htmlFor="htarget">Meta: {target} {target === 1 ? 'dia' : 'dias'} por semana</label>
        <input id="htarget" type="range" min={1} max={7} value={target} onChange={e => setTarget(Number(e.target.value))} />
        <button className="btn" type="submit">Plantar</button>
      </form>

      {habits.length === 0 ? (
        <p className="empty">Seu jardim está vazio. Plante o primeiro hábito acima.</p>
      ) : (
        <ul className="garden">
          {habits.map(h => {
            const st = stage(h, today), s = streak(h, today), wd = weekDone(h, today);
            return (
              <li key={h.id} className="card habit">
                <Plant stage={st} label={`${h.name}: ${STAGE_NAMES[st]}`} />
                <div className="info">
                  <h3>{h.emoji} {h.name}</h3>
                  <p className="meta">{STAGE_NAMES[st]} · sequência de {s} {s === 1 ? 'dia' : 'dias'} · semana {wd}/{h.target}{wd >= h.target ? ' ✓' : ''}</p>
                  <div className="week" role="group" aria-label={`Última semana de ${h.name}`}>
                    {days.map(d => {
                      const on = h.checks.includes(d);
                      const [, mm, dd] = d.split('-');
                      return <button key={d} className={'day' + (on ? ' on' : '') + (d === today ? ' today' : '')} aria-pressed={on} aria-label={`${h.name} em ${dd}/${mm}${d === today ? ' (hoje)' : ''}`} onClick={() => toggle(h.id, d)}>
                        <span>{DOW[new Date(Number(d.slice(0, 4)), Number(mm) - 1, Number(dd)).getDay()]}</span>{on ? '●' : '○'}</button>;
                    })}
                  </div>
                </div>
                <button className="del" onClick={() => remove(h)} aria-label={`Excluir ${h.name}`}>Excluir</button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
