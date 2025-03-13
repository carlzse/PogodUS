import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import "./Styles.css";

const Navigation = () => {
  return (
      <Navbar className="navbar"expand="lg" bg="dark" data-bs-theme="dark">
        <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-title">KrytykUŚ</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
                className="navbar-content my-2 my-lg-0"
                style={{ maxHeight: '100px' }}
                navbarScroll
            >
              <Nav.Link as={Link} to="/movies" className="navbar-link">Filmy</Nav.Link>
              <Nav.Link as={Link} to="/series" className="navbar-link">Seriale</Nav.Link>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Navigation;