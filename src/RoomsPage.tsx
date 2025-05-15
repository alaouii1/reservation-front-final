import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import RoomBookingTable from './RoomBookingTable';
import ReservationModal from './ReservationModal';
import { getAllSalles } from './services/salleService';
import { createReservation, getAllReservations } from './services/reservationService';
import type { SalleResponseDTO } from './types/salle';
import type { Reservation } from './types/Reservation';

interface TimeSlot {
  hour: number;
  minute: number;
  duration: number;
  isAvailable: boolean;
}

const RoomsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [rooms, setRooms] = useState<SalleResponseDTO[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching data for date:', selectedDate.toISOString());
      
      const [roomsData, reservationsResponse] = await Promise.all([
        getAllSalles(),
        getAllReservations(selectedDate)
      ]);
      
      console.log('Selected date:', selectedDate.toISOString());
      console.log('Raw reservations response:', reservationsResponse);
      console.log('Number of reservations:', reservationsResponse.length);
      console.log('First reservation (if any):', reservationsResponse[0]);
      
      setRooms(roomsData);
      setReservations(reservationsResponse);
      
      if (roomsData.length > 0 && !selectedLocation) {
        setSelectedLocation(roomsData[0].localisationNom);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      let errorMessage = 'Failed to fetch data';
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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

  const handleCellClick = (room: { id: number; name: string }, timeSlot: TimeSlot) => {
    setSelectedRoom(room);
    setSelectedTime(timeSlot);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    setSelectedTime(null);
  };

  const handleModalConfirm = async () => {
    if (!selectedRoom || !selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Format the date as YYYY-MM-DD using local date
      const dateStr = selectedDate.toLocaleDateString('en-CA'); // This gives YYYY-MM-DD in local time
      
      // Create the time strings in 24-hour format
      const startTimeStr = `${String(selectedTime.hour).padStart(2, '0')}:${String(selectedTime.minute).padStart(2, '0')}:00`;
      const endTimeStr = (() => {
        const endMinutes = selectedTime.minute + selectedTime.duration;
        const endHours = selectedTime.hour + Math.floor(endMinutes / 60);
        const finalMinutes = endMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:00`;
      })();

      // Combine date and time
      const dateDebut = `${dateStr}T${startTimeStr}`;
      const dateFin = `${dateStr}T${endTimeStr}`;

      console.log('Creating reservation with:', {
        dateDebut,
        dateFin,
        salleId: selectedRoom.id,
        utilisateurId: 1,
        statut: "EN_ATTENTE"
      });

      const response = await createReservation({
        dateDebut,
        dateFin,
        salleId: selectedRoom.id,
        utilisateurId: 1,
        statut: "EN_ATTENTE"
      });

      console.log('Reservation created:', response.data);

      // Refresh the reservations list
      await fetchData();
      
      setModalOpen(false);
      setSelectedRoom(null);
      setSelectedTime(null);
    } catch (err: any) {
      console.error('Failed to create reservation:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        setError(`Failed to create reservation: ${err.response.data.message || 'Unknown error'}`);
      } else {
        setError('Failed to create reservation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            reservations={reservations}
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
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default RoomsPage; 