import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-100 border-b border-gray-300 py-3 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="font-bold text-xl text-gray-800 tracking-tight">Logo</div>
      {/* Navigation */}
      <nav className="flex-1 flex justify-center gap-8">
        <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">View availability</a>
        <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">My bookings</a>
      </nav>
      {/* Logout */}
      <button className="text-gray-700 font-medium hover:text-red-600 transition-colors">Logout</button>
    </header>
  );
};

export default Header; 