import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { TOPICS, Question } from './bank';
import { Answer, Best, SECONDS, buildQuiz, grade, loadBest, points, updateBest } from './logic';

const KEY = 'quizdev.best';
const rd = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
type Phase = 'home' | 'play' | 'result';

function App() {
  const [phase, setPhase] = useState<Phase>('home');
  const [topic, setTopic] = useState('all');
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState(SECONDS);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState<Best>(() => loadBest(rd()));
  const [newBest, setNewBest] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(best)); } catch { /* ignore */ } }, [best]);
  useEffect(() => {
    if (phase !== 'play' || revealed) return;
    if (left <= 0) { choose(null); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  });
  useEffect(() => { if (revealed) nextRef.current?.focus(); }, [revealed]);
  useEffect(() => { if (phase === 'play') titleRef.current?.focus(); }, [idx, phase]);

  const available = topic === 'all' ? 30 : 5;
  const q = quiz[idx];

  function start() {
    const qs = buildQuiz(topic, count);
    setQuiz(qs); setIdx(0); setAnswers([]); setScore(0); setStreak(0); setPicked(null); setRevealed(false); setLeft(SECONDS); setNewBest(false); setPhase('play');
  }
  function choose(i: number | null) {
    if (revealed) return;
    const ok = i !== null && i === q.answer;
    const gain = points(ok, left, streak);
    setPicked(i); setRevealed(true); setScore(s => s + gain); setStreak(s => (ok ? s + 1 : 0));
    setAnswers(a => [...a, { qid: q.id, picked: i, correct: ok }]);
  }
  function next() {
    if (idx + 1 < quiz.length) { setIdx(idx + 1); setPicked(null); setRevealed(false); setLeft(SECONDS); return; }
    const ok = answers.filter(a => a.correct).length;
    const r = updateBest(best, topic, score, grade(ok, quiz.length).pct);
    setBest(r.best); setNewBest(r.isNew); setPhase('result');
  }
  const label = (id: string) => (id === 'all' ? 'Todos os temas' : TOPICS.find(t => t.id === id)!.label);

  return (
    <main className="wrap">
      {phase === 'home' && <section className="box">
        <p className="tag">{'</>'} desafio</p>
        <h1>Quiz Dev</h1>
        <p className="lead">Teste seus conhecimentos de JavaScript, TypeScript, React, CSS e Git. {SECONDS}s por pergunta; acertos rápidos valem mais.</p>
        <fieldset><legend>Tema</legend>
          <div className="chips">{[{ id: 'all', label: 'Todos' }, ...TOPICS].map(t => <button key={t.id} className={'chip' + (topic === t.id ? ' on' : '')} aria-pressed={topic === t.id} onClick={() => { setTopic(t.id); setCount(c => Math.min(c, t.id === 'all' ? 30 : 5)); }}>{t.label}</button>)}</div></fieldset>
        <fieldset><legend>Perguntas</legend>
          <div className="chips">{[3, 5, 10].filter(n => n <= available).map(n => <button key={n} className={'chip' + (count === n ? ' on' : '')} aria-pressed={count === n} onClick={() => setCount(n)}>{n}</button>)}</div></fieldset>
        <button className="go" onClick={start}>Começar</button>
        <h2>Seus recordes</h2>
        {Object.keys(best).length === 0 ? <p className="muted">Nenhum recorde ainda. Jogue uma rodada!</p> :
          <ul className="records">{Object.entries(best).map(([k, v]) => <li key={k}><span>{label(k)}</span><b>{v.score} pts · {v.pct}%</b></li>)}</ul>}
        {Object.keys(best).length > 0 && <button className="link" onClick={() => { if (confirm('Apagar todos os recordes?')) setBest({}); }}>Apagar recordes</button>}
      </section>}

      {phase === 'play' && q && <section className="box" aria-live="off">
        <div className="bar"><span>Pergunta {idx + 1}/{quiz.length}</span><span>{score} pts{streak > 1 ? ` · 🔥${streak}` : ''}</span></div>
        <div className="timer" role="progressbar" aria-label="Tempo restante" aria-valuemin={0} aria-valuemax={SECONDS} aria-valuenow={left}><i style={{ width: (left / SECONDS) * 100 + '%' }} className={left <= 5 ? 'low' : ''} /></div>
        <p className="muted">{label(q.topic)} · {left}s</p>
        <h2 ref={titleRef} tabIndex={-1} className="q">{q.q}</h2>
        <ul className="opts">{q.options.map((o, i) => {
          const cls = revealed ? (i === q.answer ? ' right' : i === picked ? ' wrong' : ' dim') : '';
          return <li key={i}><button className={'opt' + cls} disabled={revealed} onClick={() => choose(i)}><kbd>{'ABCD'[i]}</kbd>{o}{revealed && i === q.answer ? ' ✓' : ''}{revealed && i === picked && i !== q.answer ? ' ✗' : ''}</button></li>;
        })}</ul>
        {revealed && <div className="why" role="status"><b>{picked === null ? 'Tempo esgotado.' : picked === q.answer ? 'Correto!' : 'Não foi dessa vez.'}</b> {q.why}</div>}
        {revealed && <button ref={nextRef} className="go" onClick={next}>{idx + 1 < quiz.length ? 'Próxima' : 'Ver resultado'}</button>}
      </section>}

      {phase === 'result' && (() => { const ok = answers.filter(a => a.correct).length, g = grade(ok, quiz.length); return (
        <section className="box">
          <p className="tag">{label(topic)}</p>
          <h1>{g.label}</h1>
          <p className="big">{ok}/{quiz.length} <small>({g.pct}%)</small></p>
          <p className="lead">{score} pontos{newBest ? ' · novo recorde!' : ''}</p>
          <h2>Revisão</h2>
          <ol className="review">{quiz.map((qq, i) => { const a = answers[i]; return (
            <li key={qq.id} className={a?.correct ? 'ok' : 'ko'}><b>{qq.q}</b><br />
              {a?.correct ? `Você acertou: ${qq.options[qq.answer]}` : <>Resposta certa: {qq.options[qq.answer]}{a?.picked != null ? ` (você marcou: ${qq.options[a.picked]})` : ' (sem resposta)'}</>}</li>); })}</ol>
          <div className="row"><button className="go" onClick={start}>Jogar de novo</button><button className="go alt" onClick={() => setPhase('home')}>Mudar tema</button></div>
        </section>); })()}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
