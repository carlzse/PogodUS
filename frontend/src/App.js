import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import MainContent from './components/MainContent';


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Navigation />
                <Routes>
                    <Route path="" element={<MainContent />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
