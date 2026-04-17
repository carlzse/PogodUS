import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Wardrobe = () => {
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState('T-shirt');
    const [material, setMaterial] = useState('Bawełna');
    const [grammage, setGrammage] = useState('');
    const [isWaterproof, setIsWaterproof] = useState(false);
    const [isWindproof, setIsWindproof] = useState(false);
    const [estimatedClo, setEstimatedClo] = useState(0.09);

    const user = JSON.parse(localStorage.getItem('user'));

    // Tabela bazowa CLO (Engineering Toolbox)
    const cloTable = {
        'T-shirt': 0.09,
        'Koszula (długi rękaw)': 0.22,
        'Bluza / Sweter': 0.30,
        'Spodnie (lekkie)': 0.20,
        'Jeansy': 0.25,
        'Kurtka lekka': 0.35,
        'Kurtka zimowa': 0.70,
        'Bielizna termo': 0.15
    };

    // Automatyczne przeliczanie CLO przy zmianie kategorii lub gramatury
    useEffect(() => {
        let base = cloTable[category] || 0.1;
        if (grammage > 0) {
            // Prosta korekta: każde 100g powyżej średniej (200g) dodaje 5% izolacji
            const adjustment = (grammage - 200) / 2000;
            base = Math.max(0.05, base + adjustment);
        }
        setEstimatedClo(parseFloat(base.toFixed(2)));
    }, [category, grammage]);

    const fetchItems = async () => {
        const res = await axios.get('http://localhost:8080/api/wardrobe');
        setItems(res.data.filter(i => i.userId === user.id));
    };

    useEffect(() => { if (user) fetchItems(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            userId: user.id,
            category,
            material,
            grammage: grammage || null,
            waterproof: isWaterproof,
            windproof: isWindproof,
            estimatedClo
        };
        await axios.post('http://localhost:8080/api/wardrobe', newItem);
        fetchItems();
    };

    return (
        <Container className="mt-4 text-white">
            <Card className="p-4 bg-dark border-warning">
                <h3>Dodaj nowe ubranie</h3>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Kategoria</Form.Label>
                                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {Object.keys(cloTable).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Materiał</Form.Label>
                                <Form.Control value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="np. Bawełna" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Gramatura (g/m²)</Form.Label>
                                <Form.Control type="number" value={grammage} onChange={(e) => setGrammage(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Wyliczone CLO</Form.Label>
                                <Form.Control type="number" step="0.01" value={estimatedClo} readOnly className="bg-secondary text-white" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-4 mb-3">
                        <Form.Check type="checkbox" label="Wodoodporny" checked={isWaterproof} onChange={e => setIsWaterproof(e.target.checked)} />
                        <Form.Check type="checkbox" label="Wiatroszczelny" checked={isWindproof} onChange={e => setIsWindproof(e.target.checked)} />
                    </div>

                    <Button variant="warning" type="submit">Zapisz w szafie</Button>
                </Form>
            </Card>

            <Table striped bordered hover variant="dark" className="mt-4">
                <thead>
                <tr>
                    <th>Kategoria</th>
                    <th>Materiał</th>
                    <th>Właściwości</th>
                    <th>CLO</th>
                </tr>
                </thead>
                <tbody>
                {items.map(item => (
                    <tr key={item.id}>
                        <td>{item.category}</td>
                        <td>{item.material} ({item.grammage}g)</td>
                        <td>
                            {item.waterproof && "🌊"} {item.windproof && "💨"}
                        </td>
                        <td className="text-warning">{item.estimatedClo}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default Wardrobe;