import React from 'react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: { id: number; name: string } | null;
  date: Date | null;
  time: number | string | null;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onConfirm, room, date, time }) => {
  if (!isOpen || !room || !date || time === null) return null;

  const formattedDate = date.toLocaleDateString();
  const formattedTime = typeof time === 'number' && time <= 12 ? `${time}am` : `${time}pm`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Finalize Reservation</h2>
        <div className="mb-4 space-y-2">
          <div><span className="font-semibold">Room:</span> {room.name}</div>
          <div><span className="font-semibold">Date:</span> {formattedDate}</div>
          <div><span className="font-semibold">Time:</span> {formattedTime}</div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 