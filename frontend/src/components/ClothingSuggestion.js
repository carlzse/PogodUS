import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ClothingSuggestion = ({ latitude, longitude }) => {
    const [recommendation, setRecommendation] = useState([]);
    const [targetClo, setTargetClo] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getWeatherAndSuggest = async () => {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Pobranie temperatury odczuwalnej, opadów i prędkości wiatru
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=apparent_temperature,precipitation,windspeed_10m&timezone=auto`
                );
                const weatherData = await weatherRes.json();
                const temp = weatherData.current.apparent_temperature;
                const isRaining = weatherData.current.precipitation > 0;
                const windSpeed = weatherData.current.windspeed_10m;

                const res = await axios.get(`http://localhost:8080/api/wardrobe/recommendation`, {
                    params: { userId: userData.id, temp: temp, rain: isRaining, windSpeed: windSpeed }
                });

                setRecommendation(res.data.items || []);
                setTargetClo(res.data.targetClo || 0);
                setError(null);
            } catch (err) {
                console.error("Błąd:", err);
                setError("Nie udało się pobrać rekomendacji.");
            } finally {
                setIsLoading(false);
            }
        };

        if (latitude && longitude) getWeatherAndSuggest();
    }, [latitude, longitude]);

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Alert variant="info">Zaloguj się, aby zobaczyć sugestie.</Alert>;
    if (isLoading) return <Spinner animation="border" variant="warning" className="d-block mx-auto my-3" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    const currentTotalClo = recommendation.reduce((acc, curr) => acc + (curr.estimatedClo || 0), 0);

    return (
        <Card className="bg-dark text-white border-warning h-100 shadow">
            <Card.Body>
                <Card.Title className="text-warning fw-bold">Twoja idealna warstwa</Card.Title>
                <hr className="bg-warning" />

                {recommendation.length > 0 ? (
                    <>
                        <ListGroup variant="flush">
                            {recommendation.map(item => (
                                <ListGroup.Item key={item.id} className="bg-dark text-white d-flex justify-content-between align-items-center border-secondary px-0">
                                    <div>
                                        <div className="fw-bold">{item.category}</div>
                                        <small className="text-muted">{item.material}</small>
                                    </div>
                                    <span className="badge bg-outline-warning border border-warning text-warning">
                                        {item.estimatedClo.toFixed(2)} CLO
                                    </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>

                        <div className="mt-4 p-3 bg-black bg-opacity-25 rounded border border-secondary">
                            <Row className="text-center g-0">
                                <Col>
                                    <div className="text-muted small">CEL (POGODA)</div>
                                    <div className="h5 mb-0 text-info">{targetClo.toFixed(2)}</div>
                                </Col>
                                <Col>
                                    <div className="text-muted small">TWOJA SUMA</div>
                                    <div className={`h5 mb-0 ${currentTotalClo >= targetClo ? 'text-success' : 'text-warning'}`}>
                                        {currentTotalClo.toFixed(2)}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">Brak ubrań pasujących do celu {targetClo.toFixed(2)} CLO.</div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClothingSuggestion;