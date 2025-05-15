import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import RoomsPage from './RoomsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<RoomsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
