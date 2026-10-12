// Aplicativo de Clima
document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const cityChips = document.querySelectorAll('.city-chip');

    // Elementos do card de clima
    const cityNameEl = document.getElementById('city-name');
    const countryEl = document.getElementById('country');
    const tempEl = document.getElementById('temp');
    const iconEl = document.getElementById('weather-icon');
    const descEl = document.getElementById('weather-desc');
    const humidityEl = document.getElementById('humidity');
    const windEl = document.getElementById('wind');
    const feelsLikeEl = document.getElementById('feels-like');

    // Chave de API (demo, sem funcionalidade real sem a chave)
    const API_KEY = 'YOUR_API_KEY'; // Para projeto real, usar variável de ambiente

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeather(city);
            }
        }
    });

    cityChips.forEach(chip => {
        chip.addEventListener('click', () => {
            getWeather(chip.dataset.city);
        });
    });

    // Função simulada (já que não temos chave de API)
    function getWeather(city) {
        // Em um app real, aqui viria o fetch para a API (OpenWeatherMap por exemplo)
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`);

        // Simulando a resposta para exibição da interface
        console.log(`Buscando clima para: ${city}`);

        // Simulação de dados
        const simulatedData = {
            name: city,
            sys: { country: 'BR' },
            main: { temp: (Math.random() * 20 + 15).toFixed(1), humidity: Math.floor(Math.random() * 50 + 40), feels_like: (Math.random() * 20 + 15).toFixed(1) },
            wind: { speed: (Math.random() * 20).toFixed(1) },
            weather: [{ description: 'Céu limpo', icon: '☀️' }]
        };

        updateUI(simulatedData);
    }

    function updateUI(data) {
        cityNameEl.textContent = data.name;
        countryEl.textContent = data.sys.country;
        tempEl.textContent = data.main.temp;
        descEl.textContent = data.weather[0].description;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${data.wind.speed} km/h`;
        feelsLikeEl.textContent = `${data.main.feels_like}°C`;
        iconEl.textContent = data.weather[0].icon;
    }
});