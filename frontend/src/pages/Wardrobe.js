import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './Wardrobe.css';

const Wardrobe = () => {
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState('T-shirt');
    const [material, setMaterial] = useState('Bawełna');
    const [name, setName] = useState('');
    const [grammage, setGrammage] = useState('');
    const [isWaterproof, setIsWaterproof] = useState(false);
    const [isWindproof, setIsWindproof] = useState(false);
    const [estimatedClo, setEstimatedClo] = useState(0.09);

    const user = JSON.parse(localStorage.getItem('user'));

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

    useEffect(() => {
        let base = cloTable[category] || 0.1;
        if (grammage > 0) {
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
        const composedMaterial = name ? `${material} (${name})` : material;
        const newItem = {
            userId: user.id,
            category,
            material: composedMaterial,
            grammage: grammage || null,
            waterproof: isWaterproof,
            windproof: isWindproof,
            estimatedClo
        };
        await axios.post('http://localhost:8080/api/wardrobe', newItem);
        setName('');
        setGrammage('');
        setIsWaterproof(false);
        setIsWindproof(false);
        fetchItems();
    };

    return (
        <Container className="mt-4 wardrobe-page">
            <Card className="p-4 wardrobe-card">
                <h3 className="wardrobe-title mb-1">Twoja garderoba</h3>
                <p className="wardrobe-subtitle mb-4">Dodaj ubranie w 3 prostych krokach: wybierz typ, uzupełnij szczegóły i zapisz.</p>
                <Form onSubmit={handleSubmit} className="wardrobe-form">
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>1) Kategoria</Form.Label>
                                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {Object.keys(cloTable).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>2) Nazwa ubrania (opcjonalnie)</Form.Label>
                                <Form.Control value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Granatowa bluza sportowa" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>3) Materiał</Form.Label>
                                <Form.Control value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="np. Bawełna" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Gramatura (g/m²)</Form.Label>
                                <Form.Control type="number" min="0" value={grammage} onChange={(e) => setGrammage(e.target.value)} placeholder="np. 220" />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <div className="wardrobe-clo-preview mb-3 mt-md-4">
                                Szacowana izolacja cieplna CLO: <strong>{estimatedClo}</strong>
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex flex-wrap gap-4 mb-3">
                        <Form.Check type="checkbox" label="Wodoodporne" checked={isWaterproof} onChange={e => setIsWaterproof(e.target.checked)} />
                        <Form.Check type="checkbox" label="Wiatroszczelne" checked={isWindproof} onChange={e => setIsWindproof(e.target.checked)} />
                    </div>

                    <Button variant="warning" type="submit">Dodaj ubranie</Button>
                </Form>
            </Card>

            <Card className="p-3 mt-4 wardrobe-card">
                <h5 className="wardrobe-title mb-3">Ubrania w bazie</h5>
                <div className="wardrobe-table-wrap">
                    <Table bordered hover className="wardrobe-table ">
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
                                <td>{item.material} {item.grammage ? `(${item.grammage}g)` : ''}</td>
                                <td>
                                    {item.waterproof && <span className="wardrobe-tag">🌊 Wodoodporne</span>}
                                    {item.windproof && <span className="wardrobe-tag">💨 Wiatroszczelne</span>}
                                    {!item.windproof && !item.waterproof && <span className="text-muted">Brak</span>}
                                </td>
                                <td className="text-warning fw-semibold">{item.estimatedClo}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default Wardrobe;
