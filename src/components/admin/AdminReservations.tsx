import React, { useState, useEffect } from 'react';
import { getAllReservations } from '../../services/reservationService';
import type { Reservation, ReservationStatus } from '../../types/Reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { getAllLocalisations, type Localisation } from '../../services/localisationService';

const StatusBadge = ({ statut }: { statut: ReservationStatus }) => {
  const statusConfig: Record<ReservationStatus | 'default', {
    text: string;
    className: string;
  }> = {
    EN_ATTENTE: {
      text: 'En attente',
      className: 'bg-yellow-50 text-yellow-600 border border-yellow-100'
    },
    CONFIRMEE: {
      text: 'Confirmée',
      className: 'bg-green-50 text-green-600 border border-green-100'
    },
    ANNULEE: {
      text: 'Annulée',
      className: 'bg-gray-50 text-gray-500 border border-gray-100'
    },
    default: {
      text: 'Status inconnu',
      className: 'bg-gray-50 text-gray-500 border border-gray-100'
    }
  };

  const config = statusConfig[statut] || statusConfig.default;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.text}
    </div>
  );
};

function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching reservations and locations...');
      
      // Fetch both reservations and locations in parallel
      const [reservationsData, locationsData] = await Promise.all([
        getAllReservations(),
        getAllLocalisations()
      ]);

      console.log('Raw reservations data:', reservationsData);
      console.log('Locations data:', locationsData);
      
      if (!Array.isArray(reservationsData)) {
        throw new Error('Format de données invalide pour les réservations');
      }
      
      setReservations(reservationsData);
      setLocations(locationsData);
    } catch (error: any) {
      console.error('Error in fetchData:', error);
      let errorMessage = 'Erreur lors du chargement des données';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'Pas de réponse du serveur';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (reservationId: number, newStatus: ReservationStatus) => {
    try {
      await axios.patch(`/api/reservations/${reservationId}/status`, { statut: newStatus });
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, statut: newStatus }
          : reservation
      ));
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'PPp', { locale: fr });
  };

  const filteredReservations = selectedLocation === 'all'
    ? reservations
    : reservations.filter(reservation => 
        reservation.salle?.localisationNom === selectedLocation
      );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="location-filter" className="text-sm font-medium text-gray-700">
            Filtrer par localisation:
          </label>
          <select
            id="location-filter"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Toutes les localisations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.nom}>
                {location.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map((reservation) => {
              return (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.salle?.nom || 'Salle inconnue'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.salle?.localisationNom || 'Localisation inconnue'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.utilisateur?.nom || 'N/A'} {reservation.utilisateur?.prenom || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.utilisateur?.email || 'Email inconnu'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.dateDebut ? formatDateTime(reservation.dateDebut) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.dateFin ? formatDateTime(reservation.dateFin) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.description || 'Aucune description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge statut={reservation.statut} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {reservation.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'CONFIRMEE')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'ANNULEE')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                    {reservation.statut === 'CONFIRMEE' && (
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'ANNULEE')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReservations; 