import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import AdminRooms from '../components/admin/AdminRooms';
import AdminLocations from '../components/admin/AdminLocations';
import AdminReservations from '../components/admin/AdminReservations';
import AdminUsers from '../components/admin/AdminUsers';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'locations' | 'reservations' | 'users'>('reservations');

  const tabs = [
    { id: 'reservations', label: 'Réservations', path: '/admin/reservations' },
    { id: 'rooms', label: 'Salles', path: '/admin/rooms' },
    { id: 'locations', label: 'Localisations', path: '/admin/locations' },
    { id: 'users', label: 'Utilisateurs', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex w-full -mb-px">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex-1 text-center`}
                  onClick={() => setActiveTab(tab.id as 'rooms' | 'locations' | 'reservations' | 'users')}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6">
            <Routes>
            <Route path="/reservations" element={<AdminReservations />} />
              <Route path="/" element={<AdminReservations />} />
              <Route path="/rooms" element={<AdminRooms />} />
              <Route path="/locations" element={<AdminLocations />} />
              
              <Route path="/users" element={<AdminUsers />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 