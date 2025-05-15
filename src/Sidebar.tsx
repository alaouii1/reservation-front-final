import React from 'react';
import Calendar from './Calendar';

interface SidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedDate, onDateChange }) => {
  return (
    <aside className="w-full max-w-xs bg-gray-50 p-4 border-r border-gray-200 min-h-screen flex flex-col gap-6">
      {/* Calendar */}
      <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* Filter Section (placeholder) */}
      {/* <div>
        <h2 className="font-semibold text-gray-700 mb-2 text-base">Filter by <span className="inline-block align-middle">▼</span></h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium text-gray-600">Floor</div>
            <label className="block"><input type="checkbox" className="mr-2" />Eight</label>
            <label className="block"><input type="checkbox" className="mr-2" />Thirteen</label>
          </div>
          <div>
            <div className="font-medium text-gray-600 mt-2">Features</div>
            <label className="block"><input type="checkbox" className="mr-2" />Mac Lab</label>
            <label className="block"><input type="checkbox" className="mr-2" />PC Lab</label>
            <label className="block"><input type="checkbox" className="mr-2" />Projector</label>
            <label className="block"><input type="checkbox" className="mr-2" />TV</label>
            <label className="block"><input type="checkbox" className="mr-2" />Operable walls</label>
            <label className="block"><input type="checkbox" className="mr-2" />Whiteboard</label>
            <label className="block"><input type="checkbox" className="mr-2" />Power outlets</label>
          </div>
          <div>
            <div className="font-medium text-gray-600 mt-2">Capacity</div>
            <label className="block"><input type="checkbox" className="mr-2" />16 seats</label>
            <label className="block"><input type="checkbox" className="mr-2" />18 seats</label>
            <label className="block"><input type="checkbox" className="mr-2" />20 seats</label>
            <label className="block"><input type="checkbox" className="mr-2" />24 seats</label>
            <label className="block"><input type="checkbox" className="mr-2" />40 seats</label>
          </div>
          <div>
            <div className="font-medium text-gray-600 mt-2">Availability</div>
            <label className="block"><input type="checkbox" className="mr-2" />Fully available</label>
            <label className="block"><input type="checkbox" className="mr-2" />Partly available</label>
            <label className="block"><input type="checkbox" className="mr-2" />Fully Booked</label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="number" placeholder="From" className="w-14 border rounded px-1 py-0.5 text-xs" />
            <span>To</span>
            <input type="number" placeholder="To" className="w-14 border rounded px-1 py-0.5 text-xs" />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">FILTER</button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">RESET</button>
          </div>
        </div>
      </div> */}

      {/* Key Section (placeholder) */}
      {/* <div className="mt-auto">
        <h2 className="font-semibold text-gray-700 mb-2 text-base">Key <span className="inline-block align-middle">▼</span></h2>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-4 h-4 bg-red-600 rounded mr-2"></span>
          <span className="text-xs">Business unit 1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-gray-300 rounded mr-2"></span>
          <span className="text-xs">Business unit 2</span>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar; 