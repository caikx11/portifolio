import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Cond, forecast, key, normalize, toF } from "./weather";

const KEY = "p059-state";
const PRESETS = ["São Paulo", "Recife", "Porto Alegre", "Lisboa", "Oslo", "Tóquio", "Cairo", "Reykjavik"];
const ICON: Record<Cond, string> = { sol: "☀️", nublado: "☁️", chuva: "🌧️", tempestade: "⛈️", neve: "❄️", neblina: "🌫️" };
const NAME: Record<Cond, string> = { sol: "Ensolarado", nublado: "Nublado", chuva: "Chuvoso", tempestade: "Tempestade", neve: "Neve", neblina: "Neblina" };
const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

interface St { city: string; fav: string[]; unit: "C" | "F" }
function load(): St {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && typeof v.city === "string" && Array.isArray(v.fav)) return { city: v.city, fav: v.fav.filter((x: unknown) => typeof x === "string"), unit: v.unit === "F" ? "F" : "C" };
  } catch { /* ignore */ }
  return { city: "São Paulo", fav: [], unit: "C" };
}

function App() {
  const [st, setSt] = useState<St>(load);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [now] = useState(() => new Date());
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* quota */ } }, [st]);

  const f = useMemo(() => forecast(st.city, now), [st.city, now]);
  const t = (c: number) => (st.unit === "C" ? Math.round(c) : toF(c));
  const isFav = st.fav.some((c) => key(c) === key(f.city));

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalize(q);
    if (c.length < 2) return setErr("Digite pelo menos 2 letras.");
    if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(c) || c.length > 40) return setErr("Nome de cidade inválido.");
    setErr(""); setSt({ ...st, city: c }); setQ("");
  };
  const toggleFav = () => setSt({ ...st, fav: isFav ? st.fav.filter((c) => key(c) !== key(f.city)) : [...st.fav, f.city] });

  const temps = f.hours.map((h) => t(h.temp));
  const lo = Math.min(...temps), hi = Math.max(...temps);
  const pts = f.hours.map((h, i) => `${(i / 23) * 460 + 20},${110 - ((t(h.temp) - lo) / Math.max(1, hi - lo)) * 80}`).join(" ");
  const cities = [...st.fav, ...PRESETS.filter((p) => !st.fav.some((c) => key(c) === key(p)))];

  return (
    <div className={"page c-" + f.cond}>
      <header>
        <h1>Clima<span>.</span>React</h1>
        <p>Previsão simulada e determinística — a mesma cidade sempre dá o mesmo resultado</p>
      </header>
      <form className="search" onSubmit={search}>
        <input value={q} onChange={(e) => { setQ(e.target.value); setErr(""); }} placeholder="Buscar qualquer cidade…" aria-label="Buscar cidade" aria-invalid={!!err} aria-describedby="err" />
        <button>Buscar</button>
        <div className="unit" role="group" aria-label="Unidade">
          {(["C", "F"] as const).map((u) => <button type="button" key={u} aria-pressed={st.unit === u} onClick={() => setSt({ ...st, unit: u })}>°{u}</button>)}
        </div>
      </form>
      <p id="err" className="err" role="alert">{err}</p>
      <div className="chips" aria-label="Cidades">
        {cities.map((c) => <button key={c} className={"chip" + (key(c) === key(f.city) ? " on" : "")} onClick={() => setSt({ ...st, city: c })}>{st.fav.includes(c) ? "★ " : ""}{c}</button>)}
      </div>
      <main>
        <section className="now">
          <div>
            <h2>{f.city}</h2>
            <p className="date">{now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            <div className="temp">{t(f.temp)}°<small>{st.unit}</small></div>
            <p className="cond">{ICON[f.cond]} {NAME[f.cond]} · sensação {t(f.feels)}°</p>
          </div>
          <button className="fav" aria-pressed={isFav} onClick={toggleFav}>{isFav ? "★ Favorita" : "☆ Favoritar"}</button>
        </section>
        <section className="stats" aria-label="Detalhes">
          <div><span>Umidade</span><b>{f.humidity}%</b></div>
          <div><span>Vento</span><b>{f.wind} km/h</b></div>
          <div><span>Índice UV</span><b>{f.uv}</b></div>
          <div><span>Chuva</span><b>{f.days[0].rain}%</b></div>
        </section>
        <section className="card">
          <h3>Próximas 24 horas</h3>
          <svg viewBox="0 0 500 140" role="img" aria-label={`Temperatura por hora, de ${lo}° a ${hi}°`}>
            <polyline points={pts} fill="none" stroke="var(--acc)" strokeWidth="3" strokeLinejoin="round" />
            {f.hours.filter((h) => h.h % 6 === 0).map((h) => {
              const x = (h.h / 23) * 460 + 20;
              return <g key={h.h}><circle cx={x} cy={110 - ((t(h.temp) - lo) / Math.max(1, hi - lo)) * 80} r="4" fill="var(--acc)" /><text x={x} y="132" textAnchor="middle" fontSize="11" fill="currentColor">{String(h.h).padStart(2, "0")}h</text><text x={x} y={100 - ((t(h.temp) - lo) / Math.max(1, hi - lo)) * 80} textAnchor="middle" fontSize="12" fill="currentColor">{t(h.temp)}°</text></g>;
            })}
          </svg>
        </section>
        <section className="card">
          <h3>7 dias</h3>
          <ul className="days">
            {f.days.map((d, i) => (
              <li key={d.date}>
                <span className="wd">{i === 0 ? "hoje" : WD[new Date(d.date + "T12:00").getDay()]}</span>
                <span aria-label={NAME[d.cond]}>{ICON[d.cond]}</span>
                <span className="rain">{d.rain}%</span>
                <span className="mm"><b>{t(d.max)}°</b> {t(d.min)}°</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
