// ClothingSuggestion.js (nowa wersja)
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';

const ClothingSuggestion = ({ latitude, longitude }) => {
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nowa funkcja pobierająca dane pogodowe bezpośrednio z Open-Meteo
    const fetchWeather = async (lat, lon) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&daily=precipitation_probability_max&timezone=auto`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (err) {
            throw new Error(`Błąd API pogodowego: ${err.message}`);
        }
    };

    // Nowa logika generowania sugestii w JS
    const generateSuggestion = (weatherData) => {
        const temp = weatherData.current.temperature_2m;
        const weatherCode = weatherData.current.weathercode;
        const wind = weatherData.current.windspeed_10m;

        let mainClothing = "koszulka";
        let description = "Dziś jest ciepło!";
        let additional = [];

        if (temp < 15) {
            mainClothing = "kurtka";
            description = "Załóż coś ciepłego!";
        } else if (temp < 20) {
            mainClothing = "bluza";
            description = "Lekkie okrycie będzie idealne";
        }

        if ((weatherCode >= 50 && weatherCode <= 99) || weatherData.daily.precipitation_probability_max[0] > 30) {
            additional.push("parasol");
        }

        if (wind > 15) additional.push("kurtka przeciwdeszczowa");

        return { mainClothing, description, additional };
    };

    useEffect(() => {
        const getSuggestion = async () => {
            try {
                // Walidacja współrzędnych
                if (!latitude || !longitude ||
                    latitude < -90 || latitude > 90 ||
                    longitude < -180 || longitude > 180) {
                    throw new Error("Nieprawidłowe współrzędne");
                }

                const weather = await fetchWeather(latitude, longitude);
                const suggestion = generateSuggestion(weather);
                setSuggestion(suggestion);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        getSuggestion();
    }, [latitude, longitude]);

    const getClothingIcon = (clothingType) => {
        if (clothingType.includes('koszulka')) return '👕';
        if (clothingType.includes('bluza')) return '🧥';
        if (clothingType.includes('kurtka')) return '🧥';
        return '👚';
    };

    const getAdditionalIcon = (item) => {
        if (item.includes('parasol')) return '☂️';
        if (item.includes('wiatrowka')) return '🌬️';
        if (item.includes('okulary')) return '🕶️';
        return '👜';
    };

    return (
        <Card className="mt-4 clothing-suggestion-card">
            <Card.Body>
                <Card.Title className="d-flex align-items-center">
                    <i className="bi bi-person-standing me-2"></i>
                    Sugerowany ubiór
                </Card.Title>

                {isLoading && (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="warning" size="sm" />
                        <span className="ms-2">Ładowanie sugestii ubioru...</span>
                    </div>
                )}

                {error && (
                    <Alert variant="warning" className="mt-3">
                        <p className="mb-0">{error}</p>
                    </Alert>
                )}

                {suggestion && (
                    <div className="mt-3">
                        <p className="mb-2">{suggestion.description}</p>

                        <div className="d-flex align-items-center mb-2">
                            <span className="clothing-icon me-2">
                                {getClothingIcon(suggestion.mainClothing)}
                            </span>
                            <span className="fw-bold">Główny ubiór:</span>
                            <span className="ms-2">{suggestion.mainClothing}</span>
                        </div>

                        {suggestion.additional.length > 0 && (
                            <div className="mt-2">
                                <span className="fw-bold">Dodatkowo warto mieć:</span>
                                <ul className="list-unstyled mt-1">
                                    {suggestion.additional.map((item, index) => (
                                        <li key={index} className="d-flex align-items-center ms-3 mb-1">
                                            <span className="me-2">{getAdditionalIcon(item)}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClothingSuggestion;