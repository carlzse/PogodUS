import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const ClothingSuggestion = ({ latitude, longitude }) => {
    const [recommendation, setRecommendation] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getWeatherAndSuggest = async () => {
            // 1. Pobieramy usera wewnątrz efektu, żeby mieć pewność, że dane są aktualne
            const userData = JSON.parse(localStorage.getItem('user'));

            // Jeśli nie ma użytkownika, nie strzelamy do API, tylko pokazujemy info o logowaniu
            if (!userData || !userData.id) {
                setIsLoading(false);
                return;
            }

            try {
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=apparent_temperature,precipitation&timezone=auto`);
                const weatherData = await weatherRes.json();

                const temp = weatherData.current.apparent_temperature;
                const isRaining = weatherData.current.precipitation > 0;

                // 2. Strzał do API tylko z poprawnym ID
                const res = await axios.get(`http://localhost:8080/api/wardrobe/recommendation`, {
                    params: {
                        userId: userData.id,
                        temp: temp,
                        rain: isRaining
                    }
                });

                setRecommendation(res.data);
                setError(null); // Czyścimy ewentualne stare błędy
            } catch (err) {
                console.error("Błąd rekomendacji:", err);
                setError("Nie udało się pobrać rekomendacji.");
            } finally {
                setIsLoading(false);
            }
        };

        if (latitude && longitude) {
            getWeatherAndSuggest();
        }
    }, [latitude, longitude]); // Reaguj na zmianę lokalizacji

    // Logika renderowania
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) return <Alert variant="info">Zaloguj się, aby zobaczyć sugestie.</Alert>;
    if (isLoading) return <Spinner animation="border" variant="warning" />;
    if (error) return <Alert variant="danger" className="mt-2">{error}</Alert>;

    return (
        <Card className="bg-dark text-white border-warning h-100">
            <Card.Body>
                <Card.Title className="text-warning">Twoja idealna warstwa</Card.Title>
                <hr className="bg-warning" />

                {recommendation.length > 0 ? (
                    <ListGroup variant="flush">
                        {recommendation.map(item => (
                            <ListGroup.Item key={item.id} className="bg-dark text-white d-flex justify-content-between align-items-center border-secondary">
                                <div>
                                    <div className="fw-bold">{item.category}</div>
                                    <small className="text-muted">{item.material} {item.grammage ? `(${item.grammage}g/m²)` : ''}</small>
                                </div>
                                <div className="text-end">
                                    <span className="badge bg-warning text-dark">{item.estimatedClo} CLO</span>
                                    <div style={{fontSize: '0.8rem'}}>
                                        {item.waterproof && " 🌊"} {item.windproof && " 💨"}
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                        <div className="mt-3 p-2 bg-secondary rounded text-center fw-bold">
                            Suma izolacji: {recommendation.reduce((acc, curr) => acc + curr.estimatedClo, 0).toFixed(2)} CLO
                        </div>
                    </ListGroup>
                ) : (
                    <div className="text-center py-4">
                        <p>Brak ubrań w szafie pasujących do obecnej pogody.</p>
                        <small className="text-muted">Dodaj więcej kategorii ubrań w zakładce Szafa.</small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClothingSuggestion;