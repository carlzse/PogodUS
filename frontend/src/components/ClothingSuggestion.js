import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ClothingSuggestion = ({ latitude, longitude }) => {
    const parseComfortOffset = (value) => {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const [recommendation, setRecommendation] = useState([]);
    const [targetClo, setTargetClo] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comfortOffset, setComfortOffset] = useState(() => parseComfortOffset(localStorage.getItem('comfortOffset')));

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
                const adjustedTemp = temp - comfortOffset;
                const isRaining = weatherData.current.precipitation > 0;
                const windSpeed = weatherData.current.windspeed_10m;

                const res = await axios.get(`http://localhost:8080/api/wardrobe/recommendation`, {
                    params: {userId: userData.id, temp: adjustedTemp, rain: isRaining, windSpeed: windSpeed}
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
    }, [latitude, longitude, comfortOffset]);

    useEffect(() => {
        const handleComfortOffsetChange = (event) => {
            const eventValue = event?.detail?.value;
            if (typeof eventValue === 'number') {
                setComfortOffset(eventValue);
                return;
            }

            setComfortOffset(parseComfortOffset(localStorage.getItem('comfortOffset')));
        };

        window.addEventListener('comfortOffsetChanged', handleComfortOffsetChange);

        return () => {
            window.removeEventListener('comfortOffsetChanged', handleComfortOffsetChange);
        };
    }, []);

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Alert variant="info">Zaloguj się, aby zobaczyć sugestie.</Alert>;
    if (isLoading) return <Spinner animation="border" variant="warning" className="d-block mx-auto my-3"/>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    const currentTotalClo = recommendation.reduce((acc, curr) => acc + (curr.estimatedClo || 0), 0);

    return (
        <Card className="glass-card h-100 shadow-none border-0">
            <Card.Body className="p-4">
                <h4 className="text-center section-title mb-0">Rekomendowany ubiór</h4>
                <div className="golden-line"></div>

                {recommendation.length > 0 ? (
                    <>
                        <ListGroup variant="flush">
                            {recommendation.map(item => (
                                <ListGroup.Item key={item.id}
                                                className="suggestion-list-item text-white d-flex align-items-center border-0">
                                    <span className="text-yellow me-3" style={{fontSize: '1.2rem'}}>•</span>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{item.category}</div>
                                        <small className="text-white-50">{item.material}</small>
                                    </div>
                                    <span className="text-yellow fw-bold">
                                    {item.estimatedClo.toFixed(2)}
                                </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>

                        <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-4">
                            <Row className="text-center g-0">
                                <Col>
                                    <div className="text-white-50 small">CEL</div>
                                    <div className="h5 mb-0 text-info">{targetClo.toFixed(2)}</div>
                                </Col>
                                <Col className="border-start border-white border-opacity-10">
                                    <div className="text-white-50 small">TWOJA SUMA</div>
                                    <div
                                        className={`h5 mb-0 ${currentTotalClo >= targetClo ? 'text-success' : 'text-yellow'}`}>
                                        {currentTotalClo.toFixed(2)}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 text-white-50">Brak ubrań w szafie pasujących do warunków.</div>
                )}
            </Card.Body>
        </Card>
    );
}

export default ClothingSuggestion;