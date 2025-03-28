import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { getUserLocation, getCoordinatesForLocation, getWeatherForCoordinates, getWeatherIcon } from '../components/GeolocationService';
import "./Styles.css";

const Home = () => {
    const [currentWeather, setCurrentWeather] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchLocation, setSearchLocation] = useState('');

    const greetings = [
        "Słonecznie czy deszczowo? Sprawdź już teraz!",
        "Twój towarzysz pogodowy w każdej chwili",
        "Pogoda na wyciągnięcie ręki",
        "Zaplanuj swój dzień z nami"
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    const fetchUserLocation = async () => {
        try {
            setIsLoading(true);
            const { latitude, longitude, weatherData } = await getUserLocation();
            setCurrentWeather(weatherData);
            setLocationName('Twoja lokalizacja');
            setIsLoading(false);
        } catch (err) {
            // Jeśli geolokalizacja nie zadziała, spróbuj domyślnej lokalizacji
            await fetchDefaultLocation();
        }
    };

    const fetchDefaultLocation = async () => {
        try {
            const { latitude, longitude, name } = await getCoordinatesForLocation('Warszawa');
            const weatherData = await getWeatherForCoordinates(latitude, longitude);
            setCurrentWeather(weatherData);
            setLocationName(name);
            setIsLoading(false);
        } catch (err) {
            setError('Nie udało się pobrać pogody');
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
            setSearchLocation('');
            setIsLoading(false);
        } catch (err) {
            setError('Nie znaleziono lokalizacji');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserLocation();
    }, []);

    return (
        <div className="weather-content-wrapper">
            <Container className="py-5">
                <div className="movie-header">
                    <h1 className="greeting-title text-center">{randomGreeting}</h1>
                    <div className="golden-line"></div>
                    <p className="text-center highlight-text mb-4">Sprawdź aktualną pogodę!</p>
                </div>

                <Row className="justify-content-center mb-4">
                    <Col md={6}>
                        <form onSubmit={handleLocationSearch} className="d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Wpisz nazwę miasta"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit" variant="primary">Szukaj</Button>
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
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Ładowanie...</span>
                        </Spinner>
                    </div>
                ) : currentWeather ? (
                    <Row className="justify-content-center mt-4">
                        <Col md={8} lg={6}>
                            <Card className="weather-card">
                                <Card.Body className="text-center">
                                    <h2 className="location-title">{locationName}</h2>
                                    <div className="weather-icon-large">
                                        {getWeatherIcon(currentWeather.current.weathercode)}
                                    </div>
                                    <h3 className="temperature">{Math.round(currentWeather.current.temperature)}°C</h3>
                                    <p className="condition">
                                        {getWeatherIcon(currentWeather.current.weathercode)}
                                        {" "}
                                        {currentWeather.current.windspeed} km/h wiatr
                                    </p>
                                    <div className="weather-details">
                                        <span>Maksymalna: {Math.round(currentWeather.daily.temperature_2m_max[0])}°C</span>
                                        <span>Minimalna: {Math.round(currentWeather.daily.temperature_2m_min[0])}°C</span>
                                    </div>
                                    <Button
                                        as={Link}
                                        to="/forecast"
                                        variant="primary"
                                        className="mt-3 forecast-btn"
                                        state={{
                                            latitude: currentWeather.current.latitude,
                                            longitude: currentWeather.current.longitude,
                                            name: locationName
                                        }}
                                    >
                                        Szczegółowa prognoza
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : null}
            </Container>
        </div>
    );
};


export default Home;