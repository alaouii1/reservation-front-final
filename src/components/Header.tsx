import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Home, User } from 'lucide-react';

import logo from '../assets/fsr.jpg';

const Header: React.FC = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  // Note: Authentication logic and user status display are removed as requested
  // to focus solely on styling and icons for navigation.

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm w-full">
      <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo and Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link to="/salles" className="flex items-center">
            <img src={logo} alt="FSR Logo" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
            <div className="flex flex-col ml-3">
              <span className="text-lg font-semibold text-gray-900">Room Booking</span>
              <span className="text-xs text-gray-500">FSR</span>
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="flex flex-1 justify-center items-center space-x-1">
          <Link
            to="/salles"

            className={`${
              location.pathname === '/salles'
                ? 'border-indigo-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}

          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Link>
          <Link
            to="/mes-reservations"
            className={`${
              location.pathname === '/mes-reservations'
                ? 'border-indigo-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Mes Réservations
          </Link>
        </nav>

        {/* Right Section: Action Button */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {isAdmin && (
            <Link
              to="/admin"
              className={`${
                location.pathname.startsWith('/admin')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              } flex items-center px-3 py-2 rounded-lg transition-colors duration-200`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-sm font-medium">Administration</span>
            </Link>
          )}
          <Link to="/">
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 