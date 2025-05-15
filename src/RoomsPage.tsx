import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import RoomBookingTable from './RoomBookingTable';
import ReservationModal from './ReservationModal';
import { getAllSalles } from './services/salleService';
import type { SalleResponseDTO } from './types/salle';

const RoomsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | string | null>(null);
  const [rooms, setRooms] = useState<SalleResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllSalles()
      .then(data => {
        setRooms(data);
        setLoading(false);
        // Set default location to the first unique location
        if (data.length > 0 && !selectedLocation) {
          setSelectedLocation(data[0].localisationNom);
        }
      })
      .catch(err => {
        setError('Failed to fetch rooms');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract unique locations from rooms
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(rooms.map(r => r.localisationNom)));
    return locs;
  }, [rooms]);

  // Filter rooms by selected location
  const filteredRooms = useMemo(() => {
    if (!selectedLocation) return rooms;
    return rooms.filter(r => r.localisationNom === selectedLocation);
  }, [rooms, selectedLocation]);

  const handleCellClick = (room: { id: number; name: string }, time: number | string) => {
    setSelectedRoom(room);
    setSelectedTime(time);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    setSelectedTime(null);
  };

  const handleModalConfirm = () => {
    // TODO: Integrate with backend
    setModalOpen(false);
    setSelectedRoom(null);
    setSelectedTime(null);
    // Optionally show a success message
  };

  return (
    <div className="flex">
      <Sidebar selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main className="flex-1 p-8">
        {/* Location filter buttons */}
        <div className="flex items-center gap-4 mb-6">
          {uniqueLocations.map(loc => (
            <button
              key={loc}
              className={`px-6 py-2 rounded-full border font-semibold text-base transition-colors shadow-sm
                ${selectedLocation === loc
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}
              `}
              onClick={() => setSelectedLocation(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
        {/* Selected location title */}
        {selectedLocation && (
          <div className="font-bold text-lg mb-2">{selectedLocation}</div>
        )}
        {loading ? (
          <div className="text-center text-gray-500">Loading rooms...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <RoomBookingTable
            selectedDate={selectedDate}
            onCellClick={handleCellClick}
            rooms={filteredRooms}
            hideLocationColumn={true}
          />
        )}
      </main>
      <ReservationModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        room={selectedRoom}
        date={selectedDate}
        time={selectedTime}
      />
    </div>
  );
};

export default RoomsPage; 