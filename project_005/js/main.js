// Clima Atual (dados simulados, determinísticos por cidade)
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const cityInput = $('city-input');
    const CITIES = {
        'são paulo': ['São Paulo', 'BR', 23, 'clear', 68, 11],
        'rio de janeiro': ['Rio de Janeiro', 'BR', 29, 'clouds', 74, 15],
        'new york': ['Nova York', 'US', 12, 'rain', 81, 19],
        'nova york': ['Nova York', 'US', 12, 'rain', 81, 19],
        'london': ['Londres', 'GB', 9, 'rain', 85, 22],
        'londres': ['Londres', 'GB', 9, 'rain', 85, 22],
        'tokyo': ['Tóquio', 'JP', 18, 'clouds', 60, 9],
        'tóquio': ['Tóquio', 'JP', 18, 'clouds', 60, 9],
        'lisboa': ['Lisboa', 'PT', 21, 'clear', 55, 14],
        'paris': ['Paris', 'FR', 11, 'clouds', 72, 12],
        'brasília': ['Brasília', 'BR', 27, 'clear', 38, 8],
        'curitiba': ['Curitiba', 'BR', 16, 'rain', 83, 13],
        'salvador': ['Salvador', 'BR', 30, 'clear', 70, 17],
        'dubai': ['Dubai', 'AE', 38, 'clear', 30, 16],
        'moscou': ['Moscou', 'RU', -4, 'snow', 88, 10]
    };
    const COND = {
        clear: ['Céu limpo', '☀️'], clouds: ['Parcialmente nublado', '⛅'],
        rain: ['Chuva leve', '🌧️'], snow: ['Neve', '❄️'], storm: ['Tempestade', '⛈️']
    };
    const conds = Object.keys(COND);
    let fahrenheit = false, current = null;
    try { fahrenheit = localStorage.getItem('climaF') === '1'; } catch (e) {}

    const list = $('city-list');
    [...new Set(Object.values(CITIES).map(c => c[0]))].forEach(n => { const o = document.createElement('option'); o.value = n; list.appendChild(o); });

    function hash(s) { let h = 7; for (const ch of s.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
    function lookup(name) {
        const known = CITIES[name.toLowerCase()];
        if (known) return { name: known[0], country: known[1], temp: known[2], cond: known[3], hum: known[4], wind: known[5] };
        const h = hash(name);
        return { name: name.replace(/\s+/g, ' ').replace(/(^|\s)\S/g, m => m.toUpperCase()), country: '??', temp: (h % 38) - 4, cond: conds[(h >> 3) % conds.length], hum: 35 + (h >> 5) % 60, wind: 4 + (h >> 7) % 28 };
    }
    const conv = c => fahrenheit ? Math.round(c * 9 / 5 + 32) : Math.round(c);

    function render() {
        if (!current) return;
        const d = current;
        $('city-name').textContent = d.name;
        $('country').textContent = d.country;
        $('temp').textContent = conv(d.temp);
        document.querySelector('.unit').textContent = fahrenheit ? '°F' : '°C';
        $('weather-desc').textContent = COND[d.cond][0];
        $('weather-icon').textContent = COND[d.cond][1];
        $('humidity').textContent = d.hum + '%';
        $('wind').textContent = d.wind + ' km/h';
        $('feels-like').textContent = conv(d.temp - d.wind / 12) + (fahrenheit ? '°F' : '°C');
        document.body.dataset.cond = d.cond;
    }
    function getWeather(city) {
        current = lookup(city);
        const card = $('weather-card');
        card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
        render();
    }
    $('search-form').addEventListener('submit', e => {
        e.preventDefault();
        const c = cityInput.value.trim();
        if (c) { getWeather(c); cityInput.blur(); }
    });
    document.querySelectorAll('.city-chip').forEach(ch => ch.addEventListener('click', () => { cityInput.value = ''; getWeather(ch.dataset.city); }));
    $('unit-toggle').addEventListener('click', () => {
        fahrenheit = !fahrenheit; try { localStorage.setItem('climaF', fahrenheit ? '1' : '0'); } catch (e) {}
        render();
    });
    getWeather('São Paulo');
});
