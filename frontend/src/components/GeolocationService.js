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
        throw new Error('Nie znaleziono lokalizacji dla: ' + location);
    } catch (error) {
        console.error('Błąd podczas wyszukiwania lokalizacji:', error);
        throw error;
    }
};

export const getWeatherForCoordinates = async (latitude, longitude) => {
    try {
        const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m,surface_pressure,cloud_cover,uv_index,dewpoint_2m&hourly=temperature_2m,weathercode,precipitation_probability,apparent_temperature,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=7`
        );

        if (!response.data || !response.data.current || !response.data.hourly || !response.data.daily) {
            throw new Error('Niekompletne dane pogodowe otrzymane z API.');
        }
        return response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych:', error);
        throw error;
    }
};

export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`);
                        const name = response.data.city || response.data.locality || 'Nieznana lokalizacja';
                        const weatherData = await getWeatherForCoordinates(latitude, longitude);
                        resolve({ latitude, longitude, weatherData, name });
                    } catch (error) {
                        console.error("Błąd podczas pobierania nazwy lokalizacji lub danych pogodowych:", error);
                        fetchDefaultLocationData().then(resolve).catch(reject);
                    }
                },
                (error) => {
                    console.error("Błąd geolokalizacji:", error);
                    fetchDefaultLocationData().then(resolve).catch(reject);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            fetchDefaultLocationData().then(resolve).catch(reject);
        }
    });
};

const fetchDefaultLocationData = async () => {
    try {
        const { latitude, longitude, name } = await getCoordinatesForLocation('Warszawa');
        const weatherData = await getWeatherForCoordinates(latitude, longitude);
        return { latitude, longitude, weatherData, name };
    } catch (defaultError) {
        console.error("Failed to fetch default location weather:", defaultError);
        throw defaultError;
    }
};

export const getWeatherIcon = (weathercode) => {
    const iconMap = {
        0: '☀️',
        1: '🌤️',
        2: '⛅',
        3: '☁️',
        45: '🌫️',
        48: '🌫️',
        51: '🌧️',
        53: '🌧️',
        55: '🌧️',
        56: '🌧️',
        57: '🌧️',
        61: '🌧️',
        63: '🌧️',
        65: '🌧️',
        66: '🌧️',
        67: '🌧️',
        71: '🌨️',
        73: '🌨️',
        75: '🌨️',
        77: '🌨️',
        80: '⛈️',
        81: '⛈️',
        82: '⛈️',
        85: '🌨️',
        86: '🌨️',
        95: '🌩️',
        96: '⛈️',
        99: '⛈️',
    };
    return iconMap[weathercode] || '❓';
};

export const getWeatherDescription = (weathercode) => {
    switch (weathercode) {
        case 0: return 'Bezchmurnie';
        case 1: return 'Głównie bezchmurnie';
        case 2: return 'Częściowe zachmurzenie';
        case 3: return 'Całkowite zachmurzenie';
        case 45: return 'Mgła';
        case 48: return 'Osadzająca się mgła';
        case 51: return 'Lekka mżawka';
        case 53: return 'Umiarkowana mżawka';
        case 55: return 'Intensywna mżawka';
        case 56: return 'Marznąca mżawka (lekka)';
        case 57: return 'Marznąca mżawka (intensywna)';
        case 61: return 'Lekki deszcz';
        case 63: return 'Umiarkowany deszcz';
        case 65: return 'Silny deszcz';
        case 66: return 'Marznący deszcz (lekki)';
        case 67: return 'Marznący deszcz (silny)';
        case 71: return 'Lekkie opady śniegu';
        case 73: return 'Umiarkowane opady śniegu';
        case 75: return 'Silne opady śniegu';
        case 77: return 'Ziarna śniegu';
        case 80: return 'Lekkie przelotne opady';
        case 81: return 'Umiarkowane przelotne opady';
        case 82: return 'Gwałtowne przelotne opady';
        case 85: return 'Lekkie opady śniegu (przelotne)';
        case 86: return 'Silne opady śniegu (przelotne)';
        case 95: return 'Burza';
        case 96: return 'Burza z lekkim gradem';
        case 99: return 'Burza z silnym gradem';
        default: return 'Nieznane warunki';
    }
};

export const getLocationName = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`);
        return response.data.city || response.data.locality || 'Nieznana lokalizacja';
    } catch (error) {
        console.error("Błąd podczas pobierania nazwy lokalizacji:", error);
        return 'Nieznana lokalizacja';
    }
};