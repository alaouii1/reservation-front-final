import React from "react";
import type { SalleResponseDTO } from './types/salle';

interface RoomBookingTableProps {
  selectedDate: Date;
  onCellClick: (room: { id: number; name: string }, time: number | string) => void;
  rooms: SalleResponseDTO[];
  hideLocationColumn?: boolean;
}

// No bookings for now; will integrate backend later
const bookings: any[] = [];

const timeSlots = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]; // 8am–8pm

const RoomBookingTable: React.FC<RoomBookingTableProps> = ({ selectedDate, onCellClick, rooms, hideLocationColumn = false }) => {
  // Helper to check if a room is booked at a given time
  const isBooked = (roomId: number, time: number) => {
    const booking = bookings.find(b => b.roomId === roomId);
    return booking ? booking.times.includes(time) : false;
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
                className="bg-gray-100 font-bold border border-gray-300 px-2 py-2 min-w-[40px] text-center"
              >
                {typeof slot === 'number' && slot <= 12 ? `${slot}am` : `${slot}pm`}
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
                  return (
                    <td
                      key={idx}
                      className={`border border-gray-300 px-2 py-2 ${booked ? "bg-red-600 text-white" : "bg-white cursor-pointer hover:bg-blue-100"}`}
                      onClick={() => {
                        if (!booked) onCellClick({ id: room.id, name: room.nom }, slot);
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