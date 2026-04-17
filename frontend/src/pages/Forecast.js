import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getWeatherForCoordinates, getWeatherIcon, getWeatherDescription } from '../components/GeolocationService';
import "../pages/StylesPages.css";

const Forecast = () => {
    const location = useLocation();
    const [forecast, setForecast] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [locationName, setLocationName] = useState('');
    const [error, setError] = useState(null);
    const [currentWeatherDetails, setCurrentWeatherDetails] = useState(null);
    const [hourlyForecastToday, setHourlyForecastToday] = useState([]);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setIsLoading(true);
                setError(null);
                let latitude, longitude, name;

                if (location.state) {
                    ({ latitude, longitude, name } = location.state);
                } else {
                    latitude = 52.2297;
                    longitude = 21.0122;
                    name = 'Warszawa';
                }

                if (!latitude || !longitude) {
                    throw new Error("Brak prawidłowych koordynatów do pobrania prognozy.");
                }

                const weatherData = await getWeatherForCoordinates(latitude, longitude);
                setForecast(weatherData);
                setLocationName(name);

                setCurrentWeatherDetails(weatherData.current);

                const now = new Date();
                const currentHour = now.getHours();
                const filteredHourly = weatherData.hourly.time
                    .map((time, index) => ({
                        time: new Date(time),
                        temperature: weatherData.hourly.temperature_2m[index],
                        weathercode: weatherData.hourly.weathercode[index],
                        precipitation_probability: weatherData.hourly.precipitation_probability[index],
                        apparent_temperature: weatherData.hourly.apparent_temperature[index],
                        windspeed_10m: weatherData.hourly.windspeed_10m[index]
                    }))
                    .filter(hourData => {
                        return hourData.time.getDate() === now.getDate() && hourData.time.getHours() >= currentHour;
                    });
                setHourlyForecastToday(filteredHourly);

                setIsLoading(false);
            } catch (err) {
                console.error('Błąd pobierania prognozy:', err);
                setError("Nie udało się pobrać danych pogodowych. Spróbuj ponownie później.");
                setIsLoading(false);
            }
        };

        fetchForecast();
    }, [location.state]);

    const getSafeTemperature = (temp) => {
        return temp !== undefined && temp !== null ? Math.round(temp) : '--';
    };

    const renderTooltip = (id, text) => (
        <Tooltip id={`tooltip-${id}`} className="custom-tooltip">
            {text}
        </Tooltip>
    );

    const renderDailyForecast = () => {
        if (!forecast || !forecast.daily || !forecast.daily.time) {
            return <p className="text-center text-white-50">Brak danych prognozy na kolejne dni.</p>;
        }

        return forecast.daily.time.map((time, index) => {
            if (index === 0) return null;

            const date = new Date(time);
            const dayOfWeek = date.toLocaleDateString('pl-PL', { weekday: 'long' });
            const dayOfMonth = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' });
            const weatherCode = forecast.daily.weathercode[index];
            const maxTemp = forecast.daily.temperature_2m_max[index];
            const minTemp = forecast.daily.temperature_2m_min[index];
            const precipitationProb = forecast.daily.precipitation_probability_max[index];

            return (
                <Col key={index} xs={12} sm={6} md={4} lg={2} className="mb-4">
                    <Card className="forecast-day-card text-center h-100">
                        <Card.Body>
                            <h5 className="day-name">{dayOfWeek}</h5>
                            <p className="date">{dayOfMonth}</p>
                            <div className="golden-line"></div>
                            <div className="weather-icon">{getWeatherIcon(weatherCode)}</div>
                            <p className="condition-text">{getWeatherDescription(weatherCode)}</p>
                            <p className="temp-range">
                                <span className="high-temp">
                                    Max: {getSafeTemperature(maxTemp)}°C
                                </span> /
                                <span className="low-temp">
                                    Min: {getSafeTemperature(minTemp)}°C
                                </span>
                            </p>
                            <p className="precipitation">
                                Prawdopodobieństwo opadów: {precipitationProb}%
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            );
        });
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4 text-white">Prognoza pogody dla {locationName}</h1>
            <div className="golden-line mb-4"></div>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            {isLoading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Ładowanie...</span>
                    </Spinner>
                    <p className="mt-2 text-white-50">Pobieranie danych pogodowych...</p>
                </div>
            ) : (
                <>
                    {currentWeatherDetails && (
                        <Row className="mb-5 justify-content-center">
                            {/* Obecne Warunki - osobny blok */}
                            <Col xs={12} lg={6} className="mb-4 mb-lg-0">
                                <Card className="current-weather-card h-100 p-4">
                                    <h3 className="mb-3 text-white text-center">Obecne Warunki</h3>
                                    <div className="golden-line mb-4"></div>
                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                        <div className="weather-icon-large me-4">
                                            {getWeatherIcon(currentWeatherDetails.weathercode)}
                                        </div>
                                        <div className="text-center">
                                            <p className="temperature-large mb-0">
                                                {getSafeTemperature(currentWeatherDetails.temperature_2m)}°C
                                            </p>
                                            <p className="condition-large mb-0">
                                                {getWeatherDescription(currentWeatherDetails.weathercode)}
                                            </p>
                                        </div>
                                    </div>
                                    {forecast.daily && forecast.daily.temperature_2m_min && forecast.daily.temperature_2m_max && (
                                        <p className="temp-range text-center">
                                            <span className="high-temp">
                                                Max: {getSafeTemperature(forecast.daily.temperature_2m_max[0])}°C
                                            </span> /
                                            <span className="low-temp">
                                                Min: {getSafeTemperature(forecast.daily.temperature_2m_min[0])}°C
                                            </span>
                                        </p>
                                    )}
                                </Card>
                            </Col>

                            {/* Szczegóły - osobny blok */}
                            <Col xs={12} lg={6}>
                                <Card className="weather-details-card h-100 p-4">
                                    <h4 className="mb-3 text-white text-center">Szczegóły</h4>
                                    <div className="golden-line mb-4"></div>
                                    <ul className="list-unstyled weather-details-list">
                                        <li className="detail-item">
                                            <span>Wilgotność: {currentWeatherDetails.relative_humidity_2m}%</span>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip('humidity', 'Zawartość pary wodnej w powietrzu wyrażona w procentach. Wysokie wartości (>70%) mogą powodować uczucie duszności.')}
                                            >
                                                <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                            </OverlayTrigger>
                                        </li>
                                        <li className="detail-item">
                                            <span>Odczuwalna: {getSafeTemperature(currentWeatherDetails.apparent_temperature)}°C</span>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip('apparent-temp', 'Temperatura odczuwalna przez człowieka, uwzględniająca wpływ wilgotności powietrza i prędkości wiatru na komfort cieplny.')}
                                            >
                                                <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                            </OverlayTrigger>
                                        </li>
                                        <li className="detail-item">
                                            <span>Wiatr: {getSafeTemperature(currentWeatherDetails.windspeed_10m)} km/h</span>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip('wind', 'Prędkość wiatru mierzona na wysokości 10 metrów nad powierzchnią ziemi. Wartości >50 km/h to silny wiatr.')}
                                            >
                                                <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                            </OverlayTrigger>
                                        </li>
                                        <li className="detail-item">
                                            <span>Ciśnienie: {getSafeTemperature(currentWeatherDetails.surface_pressure)} hPa</span>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip('pressure', 'Ciśnienie atmosferyczne na poziomie powierzchni morza. Normalne wartości: 1013-1020 hPa. Niskie ciśnienie (<1000 hPa) zwykle oznacza niepogodę.')}
                                            >
                                                <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                            </OverlayTrigger>
                                        </li>
                                        <li className="detail-item">
                                            <span>Zachmurzenie: {currentWeatherDetails.cloud_cover}%</span>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip('cloud-cover', 'Procentowe pokrycie nieba przez chmury. 0% = bezchmurne niebo, 100% = całkowicie zachmurzone.')}
                                            >
                                                <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                            </OverlayTrigger>
                                        </li>
                                        {currentWeatherDetails.uv_index !== undefined && (
                                            <li className="detail-item">
                                                <span>UV Index: {currentWeatherDetails.uv_index}</span>
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={renderTooltip('uv-index', 'Skala natężenia promieniowania UV (0-11+). Wartości: 0-2 (niskie), 3-5 (umiarkowane), 6-7 (wysokie), 8-10 (bardzo wysokie), 11+ (ekstremalne). Przy 6+ wymagana ochrona przeciwsłoneczna.')}
                                                >
                                                    <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                                </OverlayTrigger>
                                            </li>
                                        )}
                                        {currentWeatherDetails.dewpoint_2m !== undefined && (
                                            <li className="detail-item">
                                                <span>Punkt Rosy: {getSafeTemperature(currentWeatherDetails.dewpoint_2m)}°C</span>
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={renderTooltip('dewpoint', 'Temperatura, do której musi schłodzić się powietrze aby nastąpiło skraplanie pary wodnej (tworzenie rosy lub mgły). Im bliżej temperatury rzeczywistej, tym większa wilgotność.')}
                                                >
                                                    <i className="bi bi-question-circle-fill ms-2 info-icon">info</i>
                                                </OverlayTrigger>
                                            </li>
                                        )}
                                    </ul>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {hourlyForecastToday.length > 0 && (
                        <Row className="mb-5 justify-content-center">
                            <Col xs={12}>
                                <Card className="hourly-forecast-card p-4">
                                    <Card.Body>
                                        <h4 className="hourly-forecast-title text-center text-white mb-4">Prognoza godzinowa na resztę dnia</h4>
                                        <div className="golden-line mb-4"></div>
                                        <div className="hourly-scroll-container-horizontal">
                                            <div className="hourly-items-wrapper">
                                                {hourlyForecastToday.map((hourData, index) => (
                                                    <div key={index} className="hourly-item-horizontal">
                                                        <div className="hourly-time">{hourData.time.getHours()}:00</div>
                                                        <div className="hourly-icon">{getWeatherIcon(hourData.weathercode)}</div>
                                                        <div className="hourly-temperature">{getSafeTemperature(hourData.temperature)}°C</div>
                                                        <div className="hourly-condition">{getWeatherDescription(hourData.weathercode)}</div>
                                                        {hourData.precipitation_probability > 0 && (
                                                            <div className="hourly-precipitation">
                                                                {hourData.precipitation_probability}% ☔
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <h2 className="text-center mb-4 text-white">Prognoza na najbliższe dni</h2>
                    <div className="golden-line mb-4"></div>
                    <Row className="justify-content-center">
                        {renderDailyForecast()}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Forecast;