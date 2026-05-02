import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { getCoordinatesForLocation, getWeatherForCoordinates, getWeatherDescription, getWeatherIcon } from "../components/GeolocationService";
import "./StylesPages.css";

const initialFavorites = [
    { id: 1, name: "Warszawa", temp: 12, weathercode: 0, latitude: 52.2297, longitude: 21.0122 },
    { id: 2, name: "Londyn", temp: 15, weathercode: 3, latitude: 51.5074, longitude: -0.1278 },
    { id: 3, name: "Tokio", temp: 8, weathercode: 2, latitude: 35.6762, longitude: 139.6503 }
];

const Favorites = () => {
    const [favorites, setFavorites] = useState(initialFavorites);
    const [newLocation, setNewLocation] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertVariant, setAlertVariant] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddFavorite = async (e) => {
        e.preventDefault();
        const normalizedLocation = newLocation.trim();

        if (!normalizedLocation) return;

        if (favorites.some((fav) => fav.name.toLowerCase() === normalizedLocation.toLowerCase())) {
            setAlertVariant("warning");
            setAlertMessage(`${normalizedLocation} jest już na liście ulubionych.`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }

        try {
            setIsAdding(true);
            const { latitude, longitude, name } = await getCoordinatesForLocation(normalizedLocation);
            const weatherData = await getWeatherForCoordinates(latitude, longitude);

            const newFavorite = {
                id: Date.now(),
                name,
                temp: Math.round(weatherData.current.temperature_2m),
                weathercode: weatherData.current.weathercode,
                latitude,
                longitude,
            };

            setFavorites((prev) => [...prev, newFavorite]);
            setNewLocation("");
            setAlertVariant("success");
            setAlertMessage(`${name} dodano do ulubionych.`);
        } catch (error) {
            setAlertVariant("danger");
            setAlertMessage("Nie udało się dodać miasta. Sprawdź nazwę i spróbuj ponownie.");
        } finally {
            setShowAlert(true);
            setIsAdding(false);
            setTimeout(() => setShowAlert(false), 3000);
        }
    };

    const handleRemoveFavorite = (id) => {
        const locationToRemove = favorites.find((fav) => fav.id === id);
        setFavorites(favorites.filter((fav) => fav.id !== id));

        setAlertVariant("info");
        setAlertMessage(`${locationToRemove?.name || "Miasto"} usunięto z ulubionych.`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    return (
        <div className="weather-content-wrapper default-weather">
            <Container className="py-5">
                <h1 className="text-center mb-2 text-white">Ulubione miejsca</h1>
                <p className="text-center text-white-50 mb-3">Szybki dostęp do szczegółowej prognozy wybranych miast.</p>
                <div className="golden-line mb-4"></div>

                {showAlert && (
                    <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                        {alertMessage}
                    </Alert>
                )}

                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6}>
                        <Card className="glass-card p-3 border-0">
                            <Card.Body>
                                <Card.Title className="text-white mb-3">Dodaj nowe miasto</Card.Title>
                                <Form onSubmit={handleAddFavorite} className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        className="search-input"
                                        placeholder="Wpisz nazwę miasta..."
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        required
                                    />
                                    <Button className="btn-yellow" type="submit" disabled={isAdding || !newLocation.trim()}>
                                        {isAdding ? <Spinner size="sm" animation="border" /> : "Dodaj"}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    {favorites.length > 0 ? (
                        favorites.map((location) => (
                            <Col key={location.id} md={6} lg={4} className="mb-4">
                                <Card className="glass-card h-100 p-2 border-0">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Card.Title className="text-white mb-0">{location.name}</Card.Title>
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={() => handleRemoveFavorite(location.id)}
                                            >
                                                Usuń
                                            </Button>
                                        </div>
                                        <div className="weather-summary my-3 d-flex align-items-center justify-content-between">
                                            <span className="fs-2">{getWeatherIcon(location.weathercode)}</span>
                                            <span className="fs-2 fw-bold text-yellow">{location.temp}°C</span>
                                            <span className="text-white-50 text-end">{getWeatherDescription(location.weathercode)}</span>
                                        </div>
                                        <Button
                                            as={Link}
                                            to="/forecast"
                                            className="btn-yellow mt-auto"
                                            state={{ latitude: location.latitude, longitude: location.longitude, name: location.name }}
                                        >
                                            Szczegóły
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center">
                            <Card className="glass-card p-4 border-0">
                                <p className="mb-1">Nie masz jeszcze ulubionych miejsc.</p>
                                <p className="text-white-50 mb-0">Dodaj miasta, aby szybko przejść do ich prognozy.</p>
                            </Card>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default Favorites;
