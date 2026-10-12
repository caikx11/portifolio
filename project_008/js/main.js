// Weather Dashboard Javascript
document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const recentChips = document.getElementById('recent-chips');

    const currentCity = document.getElementById('current-city');
    const currentCountry = document.getElementById('current-country');
    const currentIcon = document.getElementById('current-icon');
    const currentTemp = document.getElementById('current-temp');
    const currentDesc = document.getElementById('current-desc');
    const forecastGrid = document.getElementById('forecast-grid');
    const alertsGrid = document.getElementById('alerts-grid');

    let recentCities = JSON.parse(localStorage.getItem('weatherRecent')) || ['São Paulo', 'Rio de Janeiro', 'Nova York'];

    init();

    function init() {
        renderRecentChips();
        if (recentCities.length > 0) {
            getWeather(recentCities[0]);
        }

        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) addRecentCity(city);
        });

        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) addRecentCity(city);
            }
        });
    }

    function addRecentCity(city) {
        if (!recentCities.includes(city)) {
            recentCities.unshift(city);
            if (recentCities.length > 5) recentCities.pop();
            localStorage.setItem('weatherRecent', JSON.stringify(recentCities));
            renderRecentChips();
        }
        getWeather(city);
        cityInput.value = '';
    }

    function renderRecentChips() {
        recentChips.innerHTML = '';
        recentCities.forEach(city => {
            const chip = document.createElement('button');
            chip.className = 'recent-chip';
            chip.textContent = city;
            chip.addEventListener('click', () => getWeather(city));
            recentChips.appendChild(chip);
        });
    }

    function getWeather(city) {
        // Simulando dados realistas de clima
        const temp = (Math.random() * 25 + 10).toFixed(1);
        const descList = ['Céu limpo', 'Parcialmente nublado', 'Chuva leve', 'Nublado'];
        const iconList = ['☀️', '⛅', '🌧️', '☁️'];
        const randomIdx = Math.floor(Math.random() * descList.length);

        currentCity.textContent = city;
        currentCountry.textContent = 'BR';
        currentTemp.textContent = `${temp}°C`;
        currentDesc.textContent = descList[randomIdx];
        currentIcon.textContent = iconList[randomIdx];

        renderForecast();
        renderAlerts(city);
    }

    function renderForecast() {
        forecastGrid.innerHTML = '';
        const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
        const icons = ['☀️', '⛅', '🌧️', '☀️', '⛅'];

        for (let i = 0; i < 5; i++) {
            const minTemp = Math.floor(Math.random() * 10 + 15);
            const maxTemp = minTemp + Math.floor(Math.random() * 8 + 5);

            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-day">${days[i]}</div>
                <div class="forecast-icon">${icons[i]}</div>
                <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            `;
            forecastGrid.appendChild(card);
        }
    }

    function renderAlerts(city) {
        if (Math.random() > 0.7) {
            alertsGrid.innerHTML = `
                <div class="alert-item">
                    ⚠️ Alerta de chuvas intensas válido para a região de ${city} nas próximas 24 horas.
                </div>
            `;
        } else {
            alertsGrid.innerHTML = `<p>Nenhum alerta ativo para esta região.</p>`;
        }
    }
});