import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "./Styles.css";

const Favorites = () => {
    const [favorites, setFavorites] = useState([
        { id: 1, name: "New York", temp: 72, condition: "Sunny" },
        { id: 2, name: "London", temp: 65, condition: "Cloudy" },
        { id: 3, name: "Tokyo", temp: 80, condition: "Partly Cloudy" }
    ]);
    const [newLocation, setNewLocation] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertVariant, setAlertVariant] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");

    const handleAddFavorite = (e) => {
        e.preventDefault();

        // Check if location already exists
        if (favorites.some(fav => fav.name.toLowerCase() === newLocation.toLowerCase())) {
            setAlertVariant("warning");
            setAlertMessage(`${newLocation} is already in your favorites!`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }

        // In a real application, this would fetch real weather data
        const newFavorite = {
            id: favorites.length + 1,
            name: newLocation,
            temp: Math.floor(Math.random() * 30) + 50, // Random temp between 50-80
            condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)]
        };

        setFavorites([...favorites, newFavorite]);
        setNewLocation("");

        setAlertVariant("success");
        setAlertMessage(`${newLocation} added to favorites!`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleRemoveFavorite = (id) => {
        const locationToRemove = favorites.find(fav => fav.id === id);
        setFavorites(favorites.filter(fav => fav.id !== id));

        setAlertVariant("info");
        setAlertMessage(`${locationToRemove.name} removed from favorites`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const getWeatherIcon = (condition) => {
        switch(condition.toLowerCase()) {
            case "sunny":
                return "☀️";
            case "cloudy":
                return "☁️";
            case "rainy":
                return "🌧️";
            case "partly cloudy":
                return "⛅";
            default:
                return "🌤️";
        }
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Your Favorite Locations</h1>
            <div className="golden-line mb-4"></div>

            {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}

            <Row className="justify-content-center mb-5">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Add New Location</Card.Title>
                            <Form onSubmit={handleAddFavorite}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter city name"
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={!newLocation.trim()}
                                >
                                    Add to Favorites
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
                            <Card className="favorite-card h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <Card.Title>{location.name}</Card.Title>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleRemoveFavorite(location.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    <div className="weather-summary my-3">
                                        <span className="weather-icon">{getWeatherIcon(location.condition)}</span>
                                        <span className="current-temp">{location.temp}°F</span>
                                        <span className="current-condition">{location.condition}</span>
                                    </div>
                                    <Button
                                        as={Link}
                                        to="/forecast"
                                        variant="outline-primary"
                                        className="w-100"
                                    >
                                        View Detailed Forecast
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center">
                        <Card className="p-4">
                            <p>You haven't added any favorite locations yet.</p>
                            <p>Add locations to quickly access their weather information.</p>
                        </Card>
                    </Col>
                )}
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="info-card">
                        <Card.Body>
                            <h3>Benefits of Saved Locations</h3>
                            <ul>
                                <li>Quickly access weather for places you care about</li>
                                <li>Compare conditions across different cities</li>
                                <li>Track weather patterns in multiple locations</li>
                                <li>Easily plan trips and travel</li>
                            </ul>
                            <p className="mb-0">
                                In the future, this feature will support location-based weather alerts and notifications.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Favorites;