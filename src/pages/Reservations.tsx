import { useEffect, useState } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, XCircle, Calendar, Building2, Users, Info } from 'lucide-react';
import { getUserReservations, cancelReservation } from '../services/reservationService';
import type { Reservation, ReservationStatus } from '../types/Reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const StatusBadge = ({ statut }: { statut: ReservationStatus }) => {
  const statusConfig: Record<ReservationStatus | 'default', {
    icon: typeof AlertCircle;
    text: string;
    className: string;
  }> = {
    EN_ATTENTE: {
      icon: AlertCircle,
      text: 'En attente',
      className: 'bg-yellow-50 text-yellow-600 border border-yellow-100'
    },
    CONFIRMEE: {
      icon: CheckCircle,
      text: 'Confirmée',
      className: 'bg-green-50 text-green-600 border border-green-100'
    },
    ANNULEE: {
      icon: XCircle,
      text: 'Annulée',
      className: 'bg-gray-50 text-gray-500 border border-gray-100'
    },
    default: {
      icon: AlertCircle,
      text: 'Status inconnu',
      className: 'bg-gray-50 text-gray-500 border border-gray-100'
    }
  };

  const config = statusConfig[statut] || statusConfig.default;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
};

const ReservationCard = ({ reservation, onCancel }: { reservation: Reservation; onCancel: (id: number) => void }) => {
  const canCancel = reservation.statut !== 'ANNULEE';
  const dateDebut = new Date(reservation.dateDebut);
  const dateFin = new Date(reservation.dateFin);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {reservation.salle.nom}
            </h3>
            <StatusBadge statut={reservation.statut} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50">
                  <Clock className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date et heure</p>
                  <p className="text-gray-700">
                    {format(dateDebut, "d MMMM yyyy, HH'h'mm", { locale: fr })} - {format(dateFin, "HH'h'mm", { locale: fr })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="text-gray-700">{reservation.salle.localisation.nom}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50">
                  <Building2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salle</p>
                  <p className="text-gray-700">{reservation.salle.description}</p>
                </div>
              </div>

              {reservation.description && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50">
                    <Info className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{reservation.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side column with cancel button */}
        <div className="flex flex-col items-end gap-4">
          {canCancel && (
            <button
              onClick={() => {
                onCancel(reservation.id);
              }}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  // Notification state (optional, but good practice)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showConfirmModal = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    console.log('Showing custom confirmation modal', { title, message, type }); // Debug log
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

   const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch reservations...');
      const response = await getUserReservations();
      console.log('Received response:', response);
      
      if (!response || !response.data) {
        console.error('Invalid response format:', response);
        setError('Format de réponse invalide');
        return;
      }
      
      setReservations(response.data);
    } catch (error: any) {
      console.error('Error in loadReservations:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    console.log(`Attempting to cancel reservation with ID: ${id}`); // Debug log
    // Use custom confirmation modal instead of window.confirm
    showConfirmModal(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ? Cette action pourrait ne pas être réversible.',
      async () => {
        try {
          await cancelReservation(id);
          await loadReservations(); // Reload the reservations after cancellation
           showNotification('Réservation annulée avec succès', 'success'); // Show success notification
        } catch (error: any) {
          console.error('Error cancelling reservation:', error);
          setError(error.response?.data?.message || 'Erreur lors de l\'annulation de la réservation');
           showNotification('Erreur lors de l\'annulation de la réservation', 'error'); // Show error notification
        }
      },
      'danger' // Use danger type for cancellation
    );
  };

  useEffect(() => {
    console.log('Component mounted, loading reservations...');
    loadReservations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadReservations}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedReservations = {
    upcoming: reservations.filter(r => new Date(r.dateDebut) > new Date() && r.statut !== 'ANNULEE'),
    past: reservations.filter(r => new Date(r.dateDebut) <= new Date() || r.statut === 'ANNULEE')
  };

  // Calculate the number of pending upcoming reservations (no longer needed for display, but keeping the filter logic)
  const pendingUpcomingCount = groupedReservations.upcoming.filter(r => r.statut === 'EN_ATTENTE').length;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
        <p className="text-gray-600">Consultez et gérez vos réservations de salles</p>
      </header>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 px-6 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            À venir {groupedReservations.upcoming.length > 0 && `(${groupedReservations.upcoming.length})`}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 px-6 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'past'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Passées
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && groupedReservations.upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="bg-rose-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation à venir</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore de réservations planifiées.</p>
            <Link
              to="/salles"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-lg shadow-md hover:from-rose-600 hover:to-rose-700 transition-all"
            >
              Réserver une salle
            </Link>
          </div>
        ) : (
          (activeTab === 'upcoming' ? groupedReservations.upcoming : groupedReservations.past).map(reservation => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {console.log('confirmModal.isOpen before rendering:', confirmModal.isOpen)} {/* Debug log */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-[100] flex items-center justify-center">
          <div className="relative mx-auto p-6 w-[400px] bg-white rounded-xl shadow-2xl">
            <div className="flex items-center mb-4">
              {confirmModal.type === 'danger' && (
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
               {confirmModal.type === 'warning' && (
                <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {confirmModal.type === 'info' && (
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900">{confirmModal.title}</h3>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{confirmModal.message}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  confirmModal.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmModal.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reservations;