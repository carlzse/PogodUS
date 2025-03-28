import React from 'react';
import { Modal, Button, Carousel } from 'react-bootstrap';
import "./Styles.css";

const Tutorial = ({ show, onHide }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="tutorial-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    PogodUŚ - Przewodnik po Aplikacji
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Carousel>
                    <Carousel.Item>
                        <div className="tutorial-slide text-center">
                            <h3>Strona Główna</h3>
                            <p>Na stronie głównej znajdziesz aktualne warunki pogodowe dla domyślnej lokalizacji.</p>
                            <div className="tutorial-icon">🏠</div>
                            <p>Kliknij "See 5-Day Forecast", aby zobaczyć szczegółową prognozę.</p>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="tutorial-slide text-center">
                            <h3>Prognoza Pogody</h3>
                            <p>Na stronie Forecast możesz sprawdzić prognozę na 5 kolejnych dni.</p>
                            <div className="tutorial-icon">📅</div>
                            <p>Wpisz nazwę miasta, aby zobaczyć jego prognozę pogody.</p>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="tutorial-slide text-center">
                            <h3>Ulubione Lokalizacje</h3>
                            <p>Dodawaj i zarządzaj swoimi ulubionymi lokalizacjami.</p>
                            <div className="tutorial-icon">❤️</div>
                            <p>Możesz dodawać nowe miasta i szybko sprawdzać ich pogodę.</p>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="tutorial-slide text-center">
                            <h3>Wyszukiwanie</h3>
                            <p>Użyj paska wyszukiwania w nawigacji, aby sprawdzić pogodę w dowolnym mieście.</p>
                            <div className="tutorial-icon">🔍</div>
                            <p>Wpisz nazwę miasta i naciśnij przycisk Search.</p>
                        </div>
                    </Carousel.Item>
                </Carousel>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => {
                        localStorage.setItem('firstVisit', 'false');
                        onHide();
                    }}
                    variant="primary"
                >
                    Rozumiem, zamknij samouczek
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Tutorial;