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
  { hour: 10, minute: 0, duration: 15, isAvailable: false }, // 10:00 - 10:15 (break)
  { hour: 10, minute: 15, duration: 90, isAvailable: true }, // 10:15 - 11:45
  { hour: 11, minute: 45, duration: 75, isAvailable: true }, // 11:45 - 13:00
  { hour: 13, minute: 0, duration: 90, isAvailable: true },  // 13:00 - 14:30
  { hour: 14, minute: 30, duration: 15, isAvailable: false }, // 14:30 - 14:45 (break)
  { hour: 14, minute: 45, duration: 90, isAvailable: true }, // 14:45 - 16:15
  { hour: 16, minute: 15, duration: 90, isAvailable: true }  // 16:15 - 17:45
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
    const isPM = slot.hour >= 12;
    const displayHour = slot.hour > 12 ? slot.hour - 12 : slot.hour;
    const minuteStr = slot.minute.toString().padStart(2, '0');
    const endTime = new Date(0, 0, 0, slot.hour, slot.minute + slot.duration);
    const endHour = endTime.getHours() > 12 ? endTime.getHours() - 12 : endTime.getHours();
    const endMinuteStr = endTime.getMinutes().toString().padStart(2, '0');
    const endIsPM = endTime.getHours() >= 12;
    
    return `${displayHour}:${minuteStr}${isPM ? 'pm' : 'am'} - ${endHour}:${endMinuteStr}${endIsPM ? 'pm' : 'am'}`;
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded mt-6 overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr>
            <th className="bg-gray-100 font-bold border border-gray-300 px-4 py-2 text-left min-w-[100px]">Room</th>
            <th className="bg-gray-100 font-bold border border-gray-300 px-4 py-2 text-left min-w-[120px]">Description</th>
            {!hideLocationColumn && (
              <th className="bg-gray-100 font-bold border border-gray-300 px-4 py-2 text-left min-w-[120px]">Location</th>
            )}
            {timeSlots.map((slot, idx) => (
              <th
                key={idx}
                className="bg-gray-100 font-bold border border-gray-300 px-2 py-2 min-w-[120px] text-center"
              >
                {formatTimeSlot(slot)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms && Array.isArray(rooms) && rooms.length > 0 ? (
            rooms.map(room => (
              <tr key={room.id}>
                <td className="border border-gray-300 px-4 py-2 text-left">{room.nom}</td>
                <td className="border border-gray-300 px-4 py-2 text-left text-gray-500">{room.description}</td>
                {!hideLocationColumn && (
                  <td className="border border-gray-300 px-4 py-2 text-left text-gray-500">{room.localisationNom}</td>
                )}
                {timeSlots.map((slot, idx) => {
                  const booked = isBooked(room.id, slot);
                  const isClickable = slot.isAvailable && !booked;
                  return (
                    <td
                      key={idx}
                      className={`border border-gray-300 px-2 py-2 ${
                        !slot.isAvailable 
                          ? "bg-gray-200 cursor-not-allowed" 
                          : booked 
                            ? "bg-red-600 text-white" 
                            : "bg-white cursor-pointer hover:bg-blue-100"
                      }`}
                      onClick={() => {
                        if (isClickable) onCellClick({ id: room.id, name: room.nom }, slot);
                      }}
                    ></td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={hideLocationColumn ? 2 + timeSlots.length : 3 + timeSlots.length} className="text-center text-gray-400 py-4">No rooms found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoomBookingTable; 