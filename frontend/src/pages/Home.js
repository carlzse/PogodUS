import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import {
    getUserLocation,
    getCoordinatesForLocation,
    getWeatherForCoordinates,
    getWeatherIcon,
    getLocationName
} from '../components/GeolocationService';
import ClothingSuggestion from '../components/ClothingSuggestion';
import "./StylesPages.css";

const Home = () => {
    const [currentWeather, setCurrentWeather] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchLocation, setSearchLocation] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [backgroundClass, setBackgroundClass] = useState('');

    const greetings = [
        "Słonecznie czy deszczowo? Sprawdź już teraz!",
        "Twój towarzysz pogodowy w każdej chwili",
        "Pogoda na wyciągnięcie ręki",
        "Zaplanuj swój dzień z nami"
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    const getBackgroundClass = (weathercode) => {
        if (weathercode === undefined || weathercode === null) {
            return '';
        }
        if (weathercode === 0) {
            return 'clear-sky';
        } else if ([1, 2, 3].includes(weathercode)) {
            return 'clouds';
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weathercode)) {
            return 'rain';
        } else if ([71, 73, 75, 77, 85, 86].includes(weathercode)) {
            return 'snow';
        } else if ([45, 48].includes(weathercode)) {
            return 'clouds';
        } else if ([95, 96, 99].includes(weathercode)) {
            return 'rain';
        }
        return '';
    };

    const validateAndSetCoordinates = (lat, lon) => {
        if (typeof lat !== 'number' || typeof lon !== 'number') {
            console.error("Invalid coordinate types:", lat, lon);
            setError('Nieprawidłowy format współrzędnych');
            return false;
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            console.error("Invalid coordinates:", lat, lon);
            setError('Nieprawidłowe współrzędne geograficzne');
            return false;
        }

        const latitude = parseFloat(lat.toFixed(6));
        const longitude = parseFloat(lon.toFixed(6));

        setCoordinates({ latitude, longitude });
        return true;
    };

    const fetchUserLocationAndWeather = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { latitude, longitude, weatherData, name } = await getUserLocation();

            if (!validateAndSetCoordinates(latitude, longitude)) {
                setError('Nie udało się pobrać poprawnych współrzędnych dla lokalizacji.');
                setIsLoading(false);
                return;
            }

            setCurrentWeather(weatherData);
            setLocationName(name);
            setBackgroundClass(getBackgroundClass(weatherData?.current?.weathercode));
            setIsLoading(false);
        } catch (err) {
            console.error("Error in fetchUserLocationAndWeather:", err);
            setError(`Nie udało się pobrać pogody: ${err.message || 'Spróbuj ponownie.'}`);
            setIsLoading(false);
            try {
                const { latitude, longitude, name } = await getCoordinatesForLocation('Warszawa');
                if (validateAndSetCoordinates(latitude, longitude)) {
                    const weatherData = await getWeatherForCoordinates(latitude, longitude);
                    setCurrentWeather(weatherData);
                    setLocationName(name);
                    setBackgroundClass(getBackgroundClass(weatherData?.current?.weathercode));
                    setError(`Nie udało się pobrać Twojej lokalizacji. Wyświetlam pogodę dla ${name}.`);
                } else {
                    setError('Nie udało się pobrać pogody dla Twojej lokalizacji ani domyślnej.');
                }
            } catch (defaultErr) {
                console.error("Error fetching default weather:", defaultErr);
                setError('Nie udało się pobrać pogody ani dla Twojej lokalizacji, ani dla domyślnej (Warszawa).');
            } finally {
                setIsLoading(false);
            }
        }
    };


    const handleLocationSearch = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            const { latitude, longitude, name } = await getCoordinatesForLocation(searchLocation);

            if (!validateAndSetCoordinates(latitude, longitude)) {
                setError('Otrzymano nieprawidłowe współrzędne dla podanej lokalizacji');
                setIsLoading(false);
                return;
            }

            const weatherData = await getWeatherForCoordinates(latitude, longitude);
            setCurrentWeather(weatherData);
            setLocationName(name);
            setSearchLocation('');
            setBackgroundClass(getBackgroundClass(weatherData?.current?.weathercode));
            setIsLoading(false);
        } catch (err) {
            console.error("Error searching location:", err);
            setError(`Nie znaleziono lokalizacji: ${err.message || 'Spróbuj inną nazwę miasta.'}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserLocationAndWeather();
    }, []);

    useEffect(() => {
        if (coordinates) {
            console.log("Current coordinates state:", coordinates);
        }
    }, [coordinates]);

    useEffect(() => {
        if (currentWeather) {
            setBackgroundClass(getBackgroundClass(currentWeather.current?.weathercode));
        }
    }, [currentWeather]);

    const formatHourlyTime = (isoTimeString) => {
        const date = new Date(isoTimeString);
        let hours = date.getHours();
        return `${hours.toString().padStart(2, '0')}:00`;
    };

    const getSafeTemperature = (temp) => {
        return typeof temp === 'number' && !isNaN(temp) ? Math.round(temp) : 'N/A';
    };

    const getHourlyForecastData = () => {
        if (!currentWeather || !currentWeather.hourly || !currentWeather.hourly.time || currentWeather.hourly.time.length === 0) {
            return [];
        }

        const now = new Date();
        const currentHour = now.getHours();

        let startIndex = currentWeather.hourly.time.findIndex(hourlyTime => {
            const date = new Date(hourlyTime);
            return date.getHours() >= currentHour;
        });

        if (startIndex === -1 || startIndex >= currentWeather.hourly.time.length - 7) {
            startIndex = 0;
        }

        const hourlySlice = {
            time: currentWeather.hourly.time.slice(startIndex, startIndex + 7),
            temperature_2m: currentWeather.hourly.temperature_2m.slice(startIndex, startIndex + 7),
            weathercode: currentWeather.hourly.weathercode.slice(startIndex, startIndex + 7),
        };

        if (hourlySlice.time.length !== hourlySlice.temperature_2m.length ||
            hourlySlice.time.length !== hourlySlice.weathercode.length) {
            console.warn("Mismatch in hourly forecast data lengths after slicing.");
            return [];
        }

        return hourlySlice.time.map((time, index) => ({
            time: time,
            temperature: hourlySlice.temperature_2m[index],
            weathercode: hourlySlice.weathercode[index],
        }));
    };

    const hourlyForecastData = getHourlyForecastData();

    return (
        <div className={`weather-content-wrapper ${backgroundClass}`}>
            <Container className="py-5">
                <Row className="justify-content-center mb-4">
                    <Col md={6} lg={5}>
                        <form onSubmit={handleLocationSearch} className="d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Wpisz nazwę miasta"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit" variant="primary">Szukaj</Button>

                        <Button
                            onClick={fetchUserLocationAndWeather}
                            className="current-location-button" // Dodaj klasę do ewentualnej stylizacji w CSS
                            disabled={isLoading} // Wyłącz przycisk, gdy trwa ładowanie danych
                        >
                            📍
                        </Button>
                        </form>
                    </Col>
                </Row>

                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {isLoading ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status" variant="light">
                            <span className="visually-hidden">Ładowanie...</span>
                        </Spinner>
                    </div>
                ) : (
                    currentWeather ? (
                        <Row className="justify-content-center mt-4 flex-wrap align-items-stretch">
                            <Col xs={12} md={6} lg={5} className="mb-4 mb-md-0 d-flex">
                                <Card className="weather-card h-100 flex-grow-1">
                                    <Card.Body className="text-center">
                                        <h2 className="location-title">{locationName}</h2>
                                        <div className="weather-icon-large">
                                            {getWeatherIcon(currentWeather.current?.weathercode)}
                                        </div>
                                        <h3 className="temperature">{getSafeTemperature(currentWeather.current?.temperature_2m)}°C</h3>
                                        <p className="condition">
                                            {currentWeather.current?.weathercode === 0 && "Czyste niebo"}
                                            {[1, 2, 3].includes(currentWeather.current?.weathercode) && "Pochmurno"}
                                            {[45, 48].includes(currentWeather.current?.weathercode) && "Mgła"}
                                            {[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(currentWeather.current?.weathercode) && "Deszcz"}
                                            {[71, 73, 75, 77, 85, 86].includes(currentWeather.current?.weathercode) && "Śnieg"}
                                            {[95, 96, 99].includes(currentWeather.current?.weathercode) && "Burza"}
                                        </p>
                                        <div className="weather-details">
                                            <span><i className="bi bi-thermometer-high"></i> Maks: {getSafeTemperature(currentWeather.daily?.temperature_2m_max?.[0])}°C</span>
                                            <span><i className="bi bi-thermometer-low"></i> Min: {getSafeTemperature(currentWeather.daily?.temperature_2m_min?.[0])}°C</span>
                                            <span><i className="bi bi-wind"></i> Wiatr: {getSafeTemperature(currentWeather.current?.windspeed_10m)} km/h</span>
                                        </div>
                                        <Button
                                            as={Link}
                                            to="/forecast"
                                            variant="primary"
                                            className="mt-3 forecast-btn"
                                            state={{
                                                latitude: coordinates?.latitude,
                                                longitude: coordinates?.longitude,
                                                name: locationName
                                            }}
                                        >
                                            Szczegółowa prognoza
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={6} lg={7} className="d-flex flex-column"> {/* Zmieniono na flex-column */}
                                <Card className="hourly-forecast-card flex-grow-1 mb-4"> {/* Dodano mb-4 i flex-grow-1 */}
                                    <Card.Body>
                                        <h4 className="hourly-forecast-title mb-4">Prognoza godzinowa</h4>
                                        <div className="hourly-items-container">
                                            {hourlyForecastData.length > 0 ? (
                                                hourlyForecastData.map((data, index) => (
                                                    <div key={data.time} className="hourly-item text-center">
                                                        <p className="hourly-time">{formatHourlyTime(data.time)}</p>
                                                        <div className="hourly-icon">
                                                            {getWeatherIcon(data.weathercode)}
                                                        </div>
                                                        <p className="hourly-temperature">{getSafeTemperature(data.temperature)}°C</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-white-50">Brak danych godzinowych do wyświetlenia lub problem z pobieraniem prognozy.</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="clothing-suggestion-card flex-grow-1"> {/* Nowy komponent Card dla sugestii */}
                                    <Card.Body>
                                        {coordinates && (
                                            <ClothingSuggestion
                                                latitude={coordinates.latitude}
                                                longitude={coordinates.longitude}
                                            />
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : null
                )}
            </Container>
        </div>
    );
};

export default Home;