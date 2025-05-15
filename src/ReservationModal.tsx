import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeSlot {
  hour: number;
  minute: number;
  duration: number;
  isAvailable: boolean;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: { id: number; name: string } | null;
  date: Date;
  time: TimeSlot | null;
  isSubmitting: boolean;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  room,
  date,
  time,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : '';
  
  // Calculate end time based on duration
  const endTime = time ? (() => {
    const endDate = new Date();
    endDate.setHours(time.hour, time.minute + time.duration, 0, 0);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  })() : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Confirmer la réservation</h2>
        <div className="space-y-4">
          <p>
            <span className="font-semibold">Salle:</span> {room?.name}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {formattedDate}
          </p>
          <p>
            <span className="font-semibold">Horaire:</span> {formattedTime} - {endTime}
          </p>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Réservation en cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 