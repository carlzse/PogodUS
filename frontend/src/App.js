import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Forecast from './pages/Forecast';
import Favorites from './pages/Favorites';
import Tutorial from './components/Tutorial';
import Wardrobe from './pages/Wardrobe';

function App() {
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const isFirstVisit = localStorage.getItem('firstVisit') === null;
        if (isFirstVisit) {
            setShowTutorial(true);
        }
    }, []);

    return (
        <>
            <Tutorial
                show={showTutorial}
                onHide={() => setShowTutorial(false)}
            />
            <BrowserRouter>
                <div className="App">
                    <Navigation />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/forecast" element={<Forecast />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/wardrobe" element={<Wardrobe />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </>
    );
}

export default App;