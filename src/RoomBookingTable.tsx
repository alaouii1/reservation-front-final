import React from "react";
import type { SalleResponseDTO } from './types/salle';
import type { Reservation } from './types/Reservation';

interface RoomBookingTableProps {
  selectedDate: Date;
  onCellClick: (room: { id: number; name: string }, time: TimeSlot) => void;
  rooms: SalleResponseDTO[];
  hideLocationColumn?: boolean;
  reservations: Reservation[];
}

interface TimeSlot {
  hour: number;
  minute: number;
  duration: number; // duration in minutes
  isAvailable: boolean;
}

// Time slots with their durations and availability
const timeSlots: TimeSlot[] = [
  { hour: 8, minute: 30, duration: 90, isAvailable: true },  // 8:30 - 10:00
  { hour: 10, minute: 15, duration: 90, isAvailable: true }, // 10:15 - 11:45
  // { hour: 11, minute: 45, duration: 75, isAvailable: true }, // 11:45 - 13:00
  { hour: 13, minute: 0, duration: 90, isAvailable: true },  // 13:00 - 14:30
  { hour: 14, minute: 45, duration: 90, isAvailable: true }, // 14:45 - 16:15

];

const RoomBookingTable: React.FC<RoomBookingTableProps> = ({ 
  selectedDate, 
  onCellClick, 
  rooms, 
  hideLocationColumn = false,
  reservations = []
}) => {
  // Helper to check if a room is booked at a given time
  const isBooked = (roomId: number, timeSlot: TimeSlot) => {
    // Get the date part in local time (YYYY-MM-DD)
    const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
    
    return reservations.some(reservation => {
      // Get the date part from the reservation
      const reservationDate = reservation.dateDebut.split('T')[0];
      const [reservationHour, reservationMinute] = reservation.dateDebut.split('T')[1].split(':').map(Number);
      const [reservationEndHour, reservationEndMinute] = reservation.dateFin.split('T')[1].split(':').map(Number);

      // Convert times to minutes for easier comparison
      const slotStartMinutes = timeSlot.hour * 60 + timeSlot.minute;
      const slotEndMinutes = slotStartMinutes + timeSlot.duration;
      const reservationStartMinutes = reservationHour * 60 + reservationMinute;
      const reservationEndMinutes = reservationEndHour * 60 + reservationEndMinute;

      // Debug logging
      console.log('Checking reservation:', {
        roomId,
        reservationRoomId: reservation.salle.id,
        selectedDateStr,
        reservationDate,
        slotTime: `${timeSlot.hour}:${timeSlot.minute} (${slotStartMinutes} - ${slotEndMinutes} minutes)`,
        reservationTime: `${reservationHour}:${reservationMinute} - ${reservationEndHour}:${reservationEndMinute} (${reservationStartMinutes} - ${reservationEndMinutes} minutes)`,
        isSameRoom: reservation.salle.id === roomId,
        isSameDate: reservationDate === selectedDateStr,
        isOverlapping: slotStartMinutes < reservationEndMinutes && slotEndMinutes > reservationStartMinutes
      });

      // Check if it's the same room, date, and if the time slots overlap
      return reservation.salle.id === roomId && 
             reservationDate === selectedDateStr && 
             slotStartMinutes < reservationEndMinutes && 
             slotEndMinutes > reservationStartMinutes;
    });
  };

  // Format time slot for display
  const formatTimeSlot = (slot: TimeSlot) => {
    const startHour = slot.hour.toString().padStart(2, '0');
    const startMinute = slot.minute.toString().padStart(2, '0');
    const endTime = new Date(0, 0, 0, slot.hour, slot.minute + slot.duration);
    const endHour = endTime.getHours().toString().padStart(2, '0');
    const endMinute = endTime.getMinutes().toString().padStart(2, '0');
    
    return `${startHour}:${startMinute}  -  ${endHour}:${endMinute}`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg mt-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="font-semibold text-slate-700 px-4 py-3 text-left min-w-[120px] border-b border-slate-200">Room</th>
            <th className="font-semibold text-slate-700 px-4 py-3 text-left min-w-[150px] border-b border-slate-200">Description</th>
            {!hideLocationColumn && (
              <th className="font-semibold text-slate-700 px-4 py-3 text-left min-w-[120px] border-b border-slate-200">Location</th>
            )}
            {timeSlots.map((slot, idx) => (
              <th
                key={idx}
                className="font-bold text-slate-700 px-3 py-3 min-w-[100px] text-center border-b border-slate-200"
              >
                {formatTimeSlot(slot)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rooms && Array.isArray(rooms) && rooms.length > 0 ? (
            rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                <td className="font-medium text-slate-900 px-4 py-3 border-r border-slate-200">
                  {room.nom}
                </td>
                <td className="text-slate-600 px-4 py-3 border-r border-slate-200">
                  {room.description.length > 20 ? `${room.description.substring(0,30)}...` : room.description}
                </td>
                {!hideLocationColumn && (
                  <td className="text-slate-600 px-4 py-3 border-r border-slate-200">
                    {room.localisationNom}
                  </td>
                )}
                {timeSlots.map((slot, idx) => {
                  const booked = isBooked(room.id, slot);
                  const isClickable = slot.isAvailable && !booked;
                  return (
                    <td
                      key={idx}
                      className={`px-3 py-3 border-r border-slate-200 transition-colors ${
                        booked 
                          ? "bg-rose-50 cursor-not-allowed" 
                          : "bg-white hover:bg-slate-50 cursor-pointer"
                      } ${idx === timeSlots.length - 1 ? 'border-r-0' : ''}`}
                      onClick={() => {
                        if (isClickable) onCellClick({ id: room.id, name: room.nom }, slot);
                      }}
                    >
                      {booked && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-rose-600 text-sm font-medium">Booked</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={hideLocationColumn ? 2 + timeSlots.length : 3 + timeSlots.length} 
                className="text-center text-slate-500 py-6"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium">No rooms found</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoomBookingTable; 