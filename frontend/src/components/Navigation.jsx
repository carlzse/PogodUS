import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import "../pages/Styles.css";

const Navigation = () => {
    return (
        <Navbar className="navbar" expand="lg" >
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="navbar-title">PogodUŚ</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="navbar-content me-auto my-2 my-lg-0"
                        style={{ maxHeight: '100px' }}
                        navbarScroll
                    >
                        <Nav.Link as={Link} to="/forecast" className="navbar-link">Forecast</Nav.Link>
                        <Nav.Link as={Link} to="/favorites" className="navbar-link">Favorites</Nav.Link>
                    </Nav>

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;