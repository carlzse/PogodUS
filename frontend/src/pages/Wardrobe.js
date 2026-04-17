import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Card } from 'react-bootstrap';
import axios from 'axios';
import "./StylesPages.css";

const Wardrobe = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [type, setType] = useState('Top');
    const [clo, setClo] = useState(0.5);
    const [waterproof, setWaterproof] = useState(false);

    // Pobieramy zalogowanego użytkownika z localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Funkcja pobierająca listę ubrań z serwera
    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/wardrobe');
            // Filtrujemy, aby pokazać tylko ubrania zalogowanego usera
            const userItems = response.data.filter(item => item.userId === user.id);
            setItems(userItems);
        } catch (error) {
            console.error("Błąd podczas pobierania ubrań:", error);
        }
    };

    useEffect(() => {
        if (user) fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            userId: user.id,
            name: name,
            type: type,
            clo: parseFloat(clo),
            waterproof: waterproof
        };

        try {
            await axios.post('http://localhost:8080/api/wardrobe', newItem);
            alert("Dodano ubiór!");
            setName(''); // czyścimy pola
            setWaterproof(false);
            fetchItems(); // odświeżamy listę
        } catch (error) {
            alert("Błąd zapisu!");
        }
    };

    if (!user) return <Container className="mt-5"><h3>Zaloguj się, aby zobaczyć szafę.</h3></Container>;

    return (
        <Container className="mt-4 text-white">
            <h2 className="mb-4">Twoja Wirtualna Szafa (Użytkownik: {user.name})</h2>

            <Card className="bg-dark text-white p-4 mb-5 border-warning">
                <h4>Dodaj nowe ubranie</h4>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nazwa ubrania</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="np. Żółty sztormiak"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Typ</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                            <option>Top</option>
                            <option>Bottom</option>
                            <option>Outerwear</option>
                            <option>Accessory</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Współczynnik izolacji (CLO)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            value={clo}
                            onChange={(e) => setClo(e.target.value)}
                        />
                    </Form.Group>

                    {/* NOWY CHECKBOX */}
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Czy jest wodoodporne?"
                            checked={waterproof}
                            onChange={(e) => setWaterproof(e.target.checked)}
                        />
                    </Form.Group>

                    <Button variant="warning" type="submit">Dodaj do szafy</Button>
                </Form>
            </Card>

            <h4 className="mt-4">Zawartość Twojej szafy:</h4>
            <Table striped bordered hover variant="dark">
                <thead>
                <tr>
                    <th>Nazwa</th>
                    <th>Typ</th>
                    <th>CLO</th>
                    <th>Wodoodporność</th>
                </tr>
                </thead>
                <tbody>
                {items.map(item => (
                    <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.clo}</td>
                        <td>{item.waterproof ? "✅ Tak" : "❌ Nie"}</td>
                    </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="4" className="text-center">Szafa jest pusta. Dodaj coś!</td></tr>}
                </tbody>
            </Table>
        </Container>
    );
};

export default Wardrobe;