import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const ClothingSuggestion = ({ latitude, longitude }) => {
    const [recommendation, setRecommendation] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const getWeatherAndSuggest = async () => {
            try {
                // 1. Pobierz pogodę
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=apparent_temperature,precipitation&timezone=auto`);
                const weatherData = await weatherRes.json();

                const temp = weatherData.current.apparent_temperature;
                const isRaining = weatherData.current.precipitation > 0;

                if (user) {
                    // 2. Jeśli zalogowany: Pobierz z bazy H2
                    const res = await axios.get(`http://localhost:8080/api/wardrobe/recommendation`, {
                        params: { userId: user.id, temp: temp, rain: isRaining }
                    });
                    setRecommendation(res.data);
                }
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        getWeatherAndSuggest();
    }, [latitude, longitude]);

    if (isLoading) return <Spinner animation="border" variant="warning" />;

    return (
        <Card className="bg-dark text-white border-warning">
            <Card.Body>
                <Card.Title>Rekomendacja ubioru</Card.Title>
                <hr className="bg-warning" />
                {user ? (
                    recommendation.length > 0 ? (
                        <ListGroup variant="flush">
                            {recommendation.map(item => (
                                <ListGroup.Item key={item.id} className="bg-dark text-white d-flex justify-content-between">
                                    <span>{item.name} ({item.type})</span>
                                    <span className="text-warning">{item.clo} CLO</span>
                                </ListGroup.Item>
                            ))}
                            <div className="mt-3 text-end fw-bold">
                                Sumaryczne CLO: {recommendation.reduce((acc, curr) => acc + curr.clo, 0).toFixed(2)}
                            </div>
                        </ListGroup>
                    ) : (
                        <p>Brak ubrań w szafie pasujących do pogody.</p>
                    )
                ) : (
                    <Alert variant="info">Zaloguj się, aby otrzymać rekomendację na podstawie Twojej szafy.</Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClothingSuggestion;