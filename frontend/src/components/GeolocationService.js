import axios from 'axios';

export const getCoordinatesForLocation = async (location) => {
    try {
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=pl&format=json`);

        if (response.data.results && response.data.results.length > 0) {
            const { latitude, longitude, name, country } = response.data.results[0];
            return {
                latitude,
                longitude,
                name,
                country
            };
        }

        throw new Error('Nie znaleziono lokalizacji');
    } catch (error) {
        console.error('Błąd podczas wyszukiwania lokalizacji:', error);
        throw error;
    }
};

export const getWeatherForCoordinates = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=Europe%2FWarsaw`);

        return {
            current: response.data.current_weather,
            hourly: response.data.hourly,
            daily: response.data.daily,
            hourlyTime: response.data.hourly.time,
            dailyTime: response.data.daily.time
        };
    } catch (error) {
        console.error('Błąd podczas pobierania pogody:', error);
        throw error;
    }
};

export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const weatherData = await getWeatherForCoordinates(latitude, longitude);
                        resolve({
                            latitude,
                            longitude,
                            weatherData
                        });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolokalizacja nie jest wspierana'));
        }
    });
};

export const getWeatherIcon = (weatherCode) => {
    // Mapowanie kodów pogodowych Open Meteo na ikony
    const weatherIcons = {
        0: '☀️',   // Czyste niebo
        1: '🌤️',   // Głównie bezchmurne
        2: '⛅',    // Częściowo pochmurne
        3: '☁️',   // Pochmurno
        45: '🌫️',  // Mgliście
        48: '🌫️',  // Szredzista mgła
        51: '🌧️',  // Mżawka
        53: '🌧️',  // Umiarkowana mżawka
        55: '🌧️',  // Gęsta mżawka
        61: '🌧️',  // Słaby deszcz
        63: '🌧️',  // Umiarkowany deszcz
        65: '🌧️',  // Silny deszcz
        71: '❄️',  // Słabe opady śniegu
        73: '❄️',  // Umiarkowane opady śniegu
        75: '❄️',  // Silne opady śniegu
        77: '❄️',  // Ziarna śniegu
        80: '🌧️',  // Przelotne deszcze
        81: '🌧️',  // Umiarkowane przelotne deszcze
        82: '🌧️',  // Gwałtowne przelotne deszcze
        85: '❄️',  // Lekkie opady śniegu
        86: '❄️',  // Silne opady śniegu
        95: '⛈️',  // Burza
        96: '⛈️',  // Burza z lekkim gradem
        99: '⛈️'   // Burza z intensywnym gradem
    };

    return weatherIcons[weatherCode] || '🌤️';


};