import React, { useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminRooms from '../components/admin/AdminRooms';
import AdminLocations from '../components/admin/AdminLocations';
import AdminReservations from '../components/admin/AdminReservations';
import AdminUsers from '../components/admin/AdminUsers';
import AdminDashboard from '../components/admin/AdminDashboard';

function AdminPage() {
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', path: '/admin' },
    { id: 'reservations', label: 'Réservations', path: '/admin/reservations' },
    { id: 'rooms', label: 'Salles', path: '/admin/rooms' },
    { id: 'locations', label: 'Localisations', path: '/admin/locations' },
    { id: 'users', label: 'Utilisateurs', path: '/admin/users' },
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path || (tab.path === '/admin' && location.pathname === '/admin/'))?.id || 'dashboard';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Administration</h2>
          <nav className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 ml-64 pt-16">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <Routes>
              <Route path="/reservations" element={<AdminReservations />} />
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/rooms" element={<AdminRooms />} />
              <Route path="/locations" element={<AdminLocations />} />
              <Route path="/users" element={<AdminUsers />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage; 