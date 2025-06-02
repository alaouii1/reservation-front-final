import React, { useEffect, useRef } from 'react';
import type { Reservation } from '../types/Reservation';
import { format, parseISO } from 'date-fns';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null; // reservation can be null when closed
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Simplified function to format just the time
  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'N/A';
    // Parse the ISO string
    const date = parseISO(dateTimeStr);
    // Format to local time (e.g., 10:00 AM)
    return format(date, 'hh:mm a');
  };

  // Simplified function to format just the date
  const formatDate = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'N/A';
    // Parse the ISO string
    const date = parseISO(dateTimeStr);
    // Format to local date (e.g., 2024-05-31)
    return format(date, 'yyyy-MM-dd');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMEE':
        return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    // Transparent overlay with click-to-close
    <div className={`fixed inset-0 z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      {/* Slider content area */}
      <div
        ref={sliderRef}
        className={`fixed top-0 right-0 h-full bg-white w-80 shadow-lg transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {reservation ? (
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
            {isAdmin ? (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Room</h3>
                  <p className="mt-1 text-sm text-gray-900">{reservation.salle.nom}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(reservation.dateDebut)} {formatTime(reservation.dateDebut)} - {formatTime(reservation.dateFin)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booked By</h3>
                  <p className="mt-1 text-sm text-gray-900">{reservation.utilisateur.nom} {reservation.utilisateur.prenom}</p>
                </div>

                {reservation.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">{reservation.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.statut)}`}
                  >
                    {reservation.statut}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Accès restreint</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Seuls les administrateurs peuvent voir les détails des réservations.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No reservation selected.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationDetailsModal; 