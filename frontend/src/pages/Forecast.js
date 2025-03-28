import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getWeatherForCoordinates, getWeatherIcon } from '../components/GeolocationService';
import "./Styles.css";

const Forecast = () => {
    const location = useLocation();
    const [forecast, setForecast] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setIsLoading(true);
                let latitude, longitude, name;

                // Jeśli przekazano dane z poprzedniej strony
                if (location.state) {
                    ({ latitude, longitude, name } = location.state);
                }
                // Jeśli nie, użyj domyślnej lokalizacji
                else {
                    // Domyślnie Warszawa
                    latitude = 52.2297;
                    longitude = 21.0122;
                    name = 'Warszawa';
                }

                const weatherData = await getWeatherForCoordinates(latitude, longitude);
                setForecast(weatherData);
                setLocationName(name);
                setIsLoading(false);
            } catch (error) {
                console.error('Błąd pobierania prognozy:', error);
                setIsLoading(false);
            }
        };

        fetchForecast();
    }, [location.state]);

    const renderDailyForecast = () => {
        if (!forecast) return null;

        return forecast.daily.time.map((date, index) => {
            const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

            return (
                <Col key={date} md={4} lg={3} className="mb-4">
                    <Card className="forecast-card h-100">
                        <Card.Body className="text-center">
                            <h3 className="day-name">{formattedDate}</h3>
                            <div className="weather-icon">
                                {getWeatherIcon(forecast.daily.weathercode[index])}
                            </div>
                            <p className="temp-range">
                                <span className="high-temp">
                                    Max: {Math.round(forecast.daily.temperature_2m_max[index])}°C
                                </span> /
                                <span className="low-temp">
                                    Min: {Math.round(forecast.daily.temperature_2m_min[index])}°C
                                </span>
                            </p>
                            <p className="precipitation">
                                Prawdopodobieństwo opadów: {forecast.daily.precipitation_probability_max[index]}%
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            );
        });
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Prognoza pogody dla {locationName}</h1>
            <div className="golden-line mb-4"></div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Ładowanie...</span>
                    </Spinner>
                </div>
            ) : (
                <Row>
                    {renderDailyForecast()}
                </Row>
            )}
        </Container>
    );
};

export default Forecast;