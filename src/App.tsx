import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import RoomsPage from './RoomsPage';
import Reservations from './pages/Reservations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/salles" element={<RoomsPage />} />
          <Route path="/mes-reservations" element={<Reservations />} />
          <Route path="/" element={<RoomsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
