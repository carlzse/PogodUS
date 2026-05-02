import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import {
    getUserLocation,
    getCoordinatesForLocation,
    getWeatherForCoordinates,
    getWeatherIcon,
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
    // Stan odpowiedzialny za dynamiczne tło
    const [backgroundClass, setBackgroundClass] = useState('');

    // Logika przypisywania klas tła na podstawie weathercode[cite: 10, 11]
    const getBackgroundClass = (weathercode) => {
        if (weathercode === 0) return 'clear-sky';
        if (weathercode === 1) return 'partly-cloudy';
        if ([2, 3].includes(weathercode)) return 'overcast';
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weathercode)) return 'rain';
        if ([71, 73, 75, 77, 85, 86].includes(weathercode)) return 'snow';
        if ([95, 96, 99].includes(weathercode)) return 'storm';
        return 'default-weather';
    };

    const fetchUserLocationAndWeather = async () => {
        try {
            setIsLoading(true);
            const { latitude, longitude, weatherData, name } = await getUserLocation();
            setCurrentWeather(weatherData);
            setLocationName(name);
            setCoordinates({ latitude, longitude });
            // Ustawienie tła[cite: 10]
            setBackgroundClass(getBackgroundClass(weatherData.current.weathercode));
            setIsLoading(false);
        } catch (err) {
            const { latitude, longitude, name } = await getCoordinatesForLocation('Warszawa');
            const weatherData = await getWeatherForCoordinates(latitude, longitude);
            setCurrentWeather(weatherData);
            setLocationName(name);
            setCoordinates({ latitude, longitude });
            setBackgroundClass(getBackgroundClass(weatherData.current.weathercode));
            setIsLoading(false);
        }
    };

    const handleLocationSearch = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const { latitude, longitude, name } = await getCoordinatesForLocation(searchLocation);
            const weatherData = await getWeatherForCoordinates(latitude, longitude);
            setCurrentWeather(weatherData);
            setLocationName(name);
            setCoordinates({ latitude, longitude });
            setBackgroundClass(getBackgroundClass(weatherData.current.weathercode));
            setSearchLocation('');
            setIsLoading(false);
        } catch (err) {
            setError("Nie znaleziono miasta.");
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUserLocationAndWeather(); }, []);

    const now = new Date();
    const hourlyForecastData = currentWeather?.hourly?.time
        ?.map((t, i) => ({
            time: t,
            timestamp: new Date(t).getTime(),
            temperature: currentWeather.hourly.temperature_2m[i],
            weathercode: currentWeather.hourly.weathercode[i],
        }))
        .filter((item) => item.timestamp >= now.getTime())
        .slice(0, 8) || [];

    return (
        /* Główny kontener z dynamiczną klasą tła[cite: 10] */
        <div className={`weather-content-wrapper ${backgroundClass}`}>
            <Container className="py-5">
                <Row className="justify-content-center mb-5">
                    <Col xs={12} lg={8}>
                        <form onSubmit={handleLocationSearch} className="search-container shadow-lg">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Wpisz nazwę miasta..."
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit" className="btn-yellow ms-2 rounded-pill">Szukaj</Button>
                            <Button variant="link" onClick={fetchUserLocationAndWeather} className="fs-4 p-0 ms-2">📍</Button>
                        </form>
                    </Col>
                </Row>

                {isLoading ? (
                    <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>
                ) : (
                    <>
                        <Row className="justify-content-center align-items-stretch mb-4">
                            <Col lg={6} md={12} className="mb-4">
                                <Card className="glass-card text-center h-100 p-4 border-0">
                                    <h2 className="fw-bold">{locationName}</h2>
                                    <div className="golden-line"></div>
                                    <div style={{ fontSize: '4rem' }}>{getWeatherIcon(currentWeather.current?.weathercode)}</div>
                                    <h1 className="display-3 fw-bold">{Math.round(currentWeather.current?.temperature_2m)}°C</h1>
                                    <p className="fs-5 text-white-50">
                                        {currentWeather.current?.weathercode === 0 ? "Czyste niebo" : "Pochmurno"}
                                    </p>
                                    <div className="mt-4 pt-3 border-top border-white border-opacity-10">
                                        <p className="mb-1 fw-medium">
                                            Maks: {Math.round(currentWeather.daily?.temperature_2m_max?.[0])}°C |
                                            Min: {Math.round(currentWeather.daily?.temperature_2m_min?.[0])}°C
                                        </p>
                                        <p className="small text-white-50 mb-0">
                                            Wiatr: {currentWeather.current?.windspeed_10m} km/h
                                        </p>
                                    </div>
                                    <Button as={Link} to="/forecast" className="btn-yellow mt-auto"
                                            state={{ latitude: coordinates?.latitude, longitude: coordinates?.longitude, name: locationName }}>
                                        Szczegółowa prognoza
                                    </Button>
                                </Card>
                            </Col>

                            <Col lg={6} md={12} className="mb-4">
                                <Card className="glass-card h-100 p-4 border-0">
                                    <h4 className="text-center">Prognoza godzinowa</h4>
                                    <div className="golden-line"></div>
                                    <div className="hourly-list">
                                        {hourlyForecastData.map((item, idx) => (
                                            <div key={idx} className="hourly-row">
                                                <span className="fw-bold">{new Date(item.time).getHours()}:00</span>
                                                <span className="fs-4">{getWeatherIcon(item.weathercode)}</span>
                                                <span className="text-yellow fw-bold">{Math.round(item.temperature)}°C</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Row><Col><ClothingSuggestion latitude={coordinates?.latitude} longitude={coordinates?.longitude} /></Col></Row>
                    </>
                )}
            </Container>
        </div>
    );
};

export default Home;