// Weather Dashboard (dados simulados e determinísticos por cidade + dia)
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const cityInput = $('city-input');
    const KNOWN = {
        'são paulo': ['São Paulo', 'BR', 22, -23], 'rio de janeiro': ['Rio de Janeiro', 'BR', 28, -22],
        'nova york': ['Nova York', 'US', 14, 40], 'new york': ['Nova York', 'US', 14, 40],
        'londres': ['Londres', 'GB', 10, 51], 'london': ['Londres', 'GB', 10, 51],
        'tóquio': ['Tóquio', 'JP', 18, 35], 'tokyo': ['Tóquio', 'JP', 18, 35],
        'lisboa': ['Lisboa', 'PT', 20, 38], 'paris': ['Paris', 'FR', 12, 48],
        'brasília': ['Brasília', 'BR', 26, -15], 'curitiba': ['Curitiba', 'BR', 17, -25],
        'dubai': ['Dubai', 'AE', 37, 25], 'moscou': ['Moscou', 'RU', -3, 55]
    };
    const KINDS = [['Céu limpo', '☀️'], ['Parcialmente nublado', '⛅'], ['Nublado', '☁️'], ['Chuva leve', '🌧️'], ['Tempestade', '⛈️']];
    const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let recent;
    try { recent = JSON.parse(localStorage.getItem('weatherRecent')); } catch (e) {}
    if (!Array.isArray(recent) || !recent.length) recent = ['São Paulo', 'Rio de Janeiro', 'Nova York'];

    function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
    function hash(s) { let h = 11; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h; }
    const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

    function model(input) {
        const k = KNOWN[input.toLowerCase()];
        const h = hash(input.toLowerCase());
        const name = k ? k[0] : input.replace(/\s+/g, ' ').replace(/(^|\s)\S/g, m => m.toUpperCase());
        const base = k ? k[2] : (h % 32) - 2;
        const now = new Date();
        const dayKey = now.getFullYear() * 400 + now.getMonth() * 32 + now.getDate();
        const r = rng(h ^ dayKey);
        const kind = Math.floor(r() * KINDS.length);
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const hr = (now.getHours() + i) % 24;
            hours.push({ hr, t: base + 5 * Math.sin(((hr - 9) / 24) * 2 * Math.PI) + (r() - .5) * 1.6 });
        }
        const days = [];
        for (let i = 1; i <= 5; i++) {
            const mx = Math.round(base + 3 + (r() - .4) * 6), mn = Math.round(mx - 5 - r() * 5);
            days.push({ d: WEEK[(now.getDay() + i) % 7], k: Math.floor(r() * KINDS.length), mx, mn });
        }
        return {
            name, country: k ? k[1] : '??', kind, temp: hours[0].t, hours, days,
            feels: hours[0].t - 1.5 + r() * 2, hum: Math.round(40 + r() * 50), wind: Math.round(4 + r() * 28),
            uv: Math.round(r() * 10), pres: Math.round(1000 + r() * 25), vis: Math.round(6 + r() * 14)
        };
    }

    function chart(hours) {
        const W = 640, H = 200, p = 28;
        const ts = hours.map(h => h.t), mn = Math.min(...ts) - 1, mx = Math.max(...ts) + 1;
        const x = i => p + (i / 23) * (W - 2 * p), y = t => H - p - ((t - mn) / (mx - mn)) * (H - 2 * p);
        const pts = hours.map((h, i) => [x(i), y(h.t)]);
        const line = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
        const area = `${line} L${x(23)} ${H - p} L${x(0)} ${H - p} Z`;
        let labels = '';
        hours.forEach((h, i) => {
            if (i % 4 === 0) labels += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${String(h.hr).padStart(2, '0')}h</text><text x="${x(i)}" y="${y(h.t) - 10}" text-anchor="middle" class="val">${Math.round(h.t)}°</text>`;
        });
        const dots = pts.filter((_, i) => i % 4 === 0).map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="4"/>`).join('');
        $('hourly-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".45"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#g)"/><path d="${line}" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labels}</svg>`;
    }

    function show(input) {
        const m = model(input);
        $('current-city').textContent = m.name;
        $('current-country').textContent = m.country;
        $('current-temp').textContent = `${Math.round(m.temp)}°C`;
        $('current-desc').textContent = KINDS[m.kind][0];
        $('current-icon').textContent = KINDS[m.kind][1];
        $('metrics').innerHTML = [['Sensação', Math.round(m.feels) + '°C'], ['Umidade', m.hum + '%'], ['Vento', m.wind + ' km/h'], ['Índice UV', m.uv], ['Pressão', m.pres + ' hPa'], ['Visibilidade', m.vis + ' km']]
            .map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
        chart(m.hours);
        $('forecast-grid').innerHTML = m.days.map(d => `<div class="forecast-card"><div class="forecast-day">${d.d}</div><div class="forecast-icon">${KINDS[d.k][1]}</div><div class="forecast-temp"><b>${d.mx}°</b> <span>${d.mn}°</span></div></div>`).join('');
        const alerts = [];
        if (m.kind === 4) alerts.push(['danger', `Tempestade prevista em ${esc(m.name)}: evite áreas abertas nas próximas horas.`]);
        if (m.kind === 3) alerts.push(['warn', `Chuva leve em ${esc(m.name)}. Leve um guarda-chuva.`]);
        if (m.uv >= 8) alerts.push(['warn', `Índice UV muito alto (${m.uv}). Use protetor solar.`]);
        if (m.wind >= 25) alerts.push(['warn', `Rajadas de vento de até ${m.wind} km/h.`]);
        if (m.temp >= 35) alerts.push(['danger', 'Onda de calor: hidrate-se e evite o sol do meio-dia.']);
        $('alerts-grid').innerHTML = alerts.length ? alerts.map(([c, t]) => `<div class="alert-item ${c}">${t}</div>`).join('') : '<p class="no-alert">Nenhum alerta ativo para esta região.</p>';
        document.querySelectorAll('.recent-chip').forEach(c => c.classList.toggle('active', c.textContent === m.name));
    }

    function renderChips() {
        const box = $('recent-chips'); box.innerHTML = '';
        recent.forEach(c => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'recent-chip'; b.textContent = c;
            b.addEventListener('click', () => show(c));
            box.appendChild(b);
        });
    }
    function search(city) {
        const name = model(city).name;
        recent = [name, ...recent.filter(c => c !== name)].slice(0, 6);
        try { localStorage.setItem('weatherRecent', JSON.stringify(recent)); } catch (e) {}
        renderChips(); show(name);
    }
    $('search-form').addEventListener('submit', e => {
        e.preventDefault();
        const c = cityInput.value.trim();
        if (c) { search(c); cityInput.value = ''; }
    });
    renderChips(); show(recent[0]);
});
