import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import { getNextReservation } from './services/reservationService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Reservation } from './types/Reservation';
import fsrLogo from './assets/fsr.jpg';

interface SidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedDate, onDateChange }) => {
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextReservation = async () => {
      try {
        const response = await getNextReservation();
        console.log('Next reservation response:', response);
        if (response.data) {
          setNextReservation(response.data);
        }
      } catch (error) {
        console.error('Error fetching next reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextReservation();
  }, []);

  return (
    <aside className="w-full max-w-xs bg-gray-50 p-4 border-r border-gray-200 min-h-screen flex flex-col gap-6">
  

      {/* Next Reservation Banner */}
      {!loading && nextReservation && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg p-4 text-white">
          <h3 className="text-sm font-semibold mb-2">Your Next Reservation</h3>
          <div className="space-y-2">
            <p className="text-sm font-medium">{nextReservation.salle.nom}</p>
            {nextReservation.description && (
              <p className="text-xs opacity-90">{nextReservation.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{nextReservation.salle.localisation.nom}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(nextReservation.dateDebut), 'EEEE d MMMM', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {format(new Date(nextReservation.dateDebut), 'HH:mm')} - {format(new Date(nextReservation.dateFin), 'HH:mm')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
      </div>

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