import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "./Styles.css";

export const MainContent = () => {
    const [topMovies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const greetings = [

        "Czy to ptak? Czy to samolot? Nie, to kolejny świetny film do obejrzenia!",
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];




    return (
        <div className="movie-content-wrapper">
            <Container className="py-5">
                <div className="movie-header">
                    <h1 className="greeting-title text-center">{randomGreeting}</h1>
                    <div className="golden-line"></div>
                    <p className="text-center highlight-text mb-4">Oto najpopularniejsze filmy i seriale!</p>
                </div>

            </Container>
        </div>
    );
};

export default MainContent;