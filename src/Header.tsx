import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Home, User } from 'lucide-react';
import logo from './assets/fsr.jpg';

const Header: React.FC = () => {

  // Note: Authentication logic and user status display are removed as requested
  // to focus solely on styling and icons for navigation.

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm w-full">
      <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo and Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link to="/" className="flex items-center">
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
            to="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Link>
          <Link
            to="/mes-reservations"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Mes Réservations
          </Link>
        </nav>

        {/* Right Section: Action Button */}
        <div className="flex items-center space-x-4 flex-shrink-0">
           {/* Added a placeholder user icon/text styled to fit theme */}
           {/* <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div> */}
          <button
            onClick={() => console.log('Action button clicked')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 