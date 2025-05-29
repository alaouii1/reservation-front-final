import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './Header';
import Login from './pages/Login';
import RoomsPage from './RoomsPage';
import Reservations from './pages/Reservations';
import AdminPage from './pages/AdminPage';
import RegisterPage from './pages/RegisterPage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/register';
  // const isAdminPage = location.pathname.startsWith('/admin'); // No longer needed for conditional header rendering

  return (
    <div className="min-h-screen bg-gray-50"> {/* Remove dynamic padding here */}
      {!isLoginPage && <Header />} {/* Always show Header if not login/register */}
      <Routes>
        <Route path="/salles" element={
          <ProtectedRoute>
            <RoomsPage />
          </ProtectedRoute>
        } />
        <Route path="/mes-reservations" element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
