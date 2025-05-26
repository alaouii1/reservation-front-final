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

  const handleModalConfirm = async (description: string) => {
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
        statut: "EN_ATTENTE",
        description
      });

      const response = await createReservation({
        dateDebut,
        dateFin,
        salleId: selectedRoom.id,
        statut: "EN_ATTENTE",
        description
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Room Booking</h1>
            <p className="text-slate-600">Select a room and time slot to make a reservation</p>
          </div>

          {/* Location filter buttons */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {uniqueLocations.map(loc => (
              <button
                key={loc}
                className={`px-6 py-2.5 rounded-lg border font-medium text-sm transition-all shadow-sm whitespace-nowrap
                  ${selectedLocation === loc
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md transform scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }
                `}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Selected location title */}
          {selectedLocation && (
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">{selectedLocation}</h2>
            </div>
          )}

          {/* Loading and error states */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                <span className="text-slate-600">Loading rooms...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
              <svg className="w-6 h-6 text-rose-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-rose-600 font-medium">{error}</p>
            </div>
          ) : (
            <RoomBookingTable
              selectedDate={selectedDate}
              onCellClick={handleCellClick}
              rooms={filteredRooms}
              hideLocationColumn={true}
              reservations={reservations}
            /> 
          )}
        </div>
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