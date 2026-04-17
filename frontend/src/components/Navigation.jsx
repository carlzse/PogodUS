import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Link, useNavigate} from 'react-router-dom';
import "../pages/StylesPages.css";
import {Modal} from "react-bootstrap";

const Navigation = () => {
    // --- STANY ---
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState('normal');
    const [language, setLanguage] = useState('pl');
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedContrast = localStorage.getItem('highContrast');
        const savedFontSize = localStorage.getItem('fontSize');
        const savedLanguage = localStorage.getItem('language');
        const savedUser = localStorage.getItem('user');

        if (savedContrast) setHighContrast(savedContrast === 'true');
        if (savedFontSize) setFontSize(savedFontSize);
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedUser) setUser(JSON.parse(savedUser));

        applyAccessibilitySettings(
            savedContrast === 'true',
            savedFontSize || 'normal',
            savedLanguage || 'pl'
        );
    }, []);

    const applyAccessibilitySettings = (contrast, size, lang) => {
        if (contrast) document.body.classList.add('high-contrast');
        else document.body.classList.remove('high-contrast');
        document.body.classList.remove('font-small', 'font-normal', 'font-large');
        document.body.classList.add(`font-${size}`);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const users = [
            { id: 1, name: 'Kacper', pass: '123' },
            { id: 2, name: 'Kasia', pass: '123' }
        ];

        const foundUser = users.find(u => u.name === username && u.pass === password);

        if (foundUser) {
            localStorage.setItem('user', JSON.stringify(foundUser));
            setUser(foundUser);
            setShowLogin(false);
            alert(`Witaj, ${foundUser.name}!`);
        } else {
            alert('Błędny użytkownik lub hasło!');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    // --- TŁUMACZENIA (z dodanymi Ulubionymi) ---
    const translations = {
        pl: {
            accessibility: "Dostępność", contrast: "Wysoki Kontrast", font: "Wielkość Czcionki",
            language: "Język", small: "Mała", normal: "Normalna", large: "Duża",
            login: "Zaloguj", logout: "Wyloguj", wardrobe: "Szafa", favorites: "Ulubione", start: "Start", forecast: "Prognoza"
        },
        en: {
            accessibility: "Accessibility", contrast: "High Contrast", font: "Font Size",
            language: "Language", small: "Small", normal: "Normal", large: "Large",
            login: "Login", logout: "Logout", wardrobe: "Wardrobe", favorites: "Favorites", start: "Start", forecast: "Forecast"
        }
    };
    const t = translations[language];
    const inputStyle = { color: '#000', backgroundColor: '#fff' };

    return (
        <>
            <Navbar expand="lg" className="navbar" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="navbar-title">PogodUŚ</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">{t.start}</Nav.Link>
                            <Nav.Link as={Link} to="/forecast">{t.forecast}</Nav.Link>
                            <Nav.Link as={Link} to="/favorites">{t.favorites}</Nav.Link>
                            {user && <Nav.Link as={Link} to="/wardrobe" className="fw-bold text-warning">{t.wardrobe}</Nav.Link>}
                        </Nav>
                        <Nav className="align-items-center">
                            {user ? (
                                <NavDropdown title={`Cześć, ${user.name}`} id="user-dropdown" className="me-3">
                                    <NavDropdown.Item onClick={handleLogout} className="text-dark">{t.logout}</NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <Button variant="outline-warning" className="me-3" onClick={() => setShowLogin(true)}>{t.login}</Button>
                            )}
                            <NavDropdown title={t.accessibility} id="accessibility-dropdown" align="end">
                                <NavDropdown.Item className="text-dark" onClick={() => {
                                    const nc = !highContrast; setHighContrast(nc);
                                    localStorage.setItem('highContrast', nc);
                                    applyAccessibilitySettings(nc, fontSize, language);
                                }}>{t.contrast}: {highContrast ? 'ON' : 'OFF'}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item className="text-dark" onClick={() => setLanguage(language === 'pl' ? 'en' : 'pl')}>
                                    {t.language}: {language.toUpperCase()}
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
                <Modal.Header closeButton style={{ color: '#000' }}>
                    <Modal.Title>Logowanie do PogodUŚ</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ color: '#000' }}>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Użytkownik</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wpisz Kacper lub Kasia"
                                style={inputStyle}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Hasło</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Wpisz 123"
                                style={inputStyle}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 mt-2">Zaloguj się</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navigation;