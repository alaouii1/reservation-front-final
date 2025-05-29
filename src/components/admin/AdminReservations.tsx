import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Reservation, ReservationStatus } from '../../types/Reservation';
import { getAllLocalisations, type Localisation } from '../../services/localisationService';

function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'past' | 'upcoming'>('upcoming');

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [editFormData, setEditFormData] = useState({
    dateDebut: '',
    dateFin: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch reservations
        const reservationsResponse = await axios.get('/api/reservations');
        if (Array.isArray(reservationsResponse.data)) {
          setReservations(reservationsResponse.data);
        } else {
          setError('Format de données invalide pour les réservations');
        }

        // Fetch locations
        const locationsData = await getAllLocalisations();
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (reservationId: number, newStatus: ReservationStatus) => {
    try {
      await axios.patch(`/api/reservations/${reservationId}/status`, { statut: newStatus });
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, statut: newStatus } as Reservation // Cast needed due to partial update
          : reservation
      ));
    } catch (error) {
      console.error('Error updating reservation status:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

   const handleDeleteReservation = async (reservationId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await axios.delete(`/api/reservations/${reservationId}`);
        setReservations(reservations.filter(reservation => reservation.id !== reservationId));
      } catch (error) {
        console.error('Error deleting reservation:', error);
        setError('Erreur lors de la suppression de la réservation');
      }
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setReservationToEdit(reservation);
    setEditFormData({
      dateDebut: reservation.dateDebut.slice(0, 16), // Assuming date format is compatible with datetime-local input
      dateFin: reservation.dateFin.slice(0, 16),
      description: reservation.description,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedReservation = async () => {
    if (!reservationToEdit) return;

    try {
      const updatedReservation = {
        ...reservationToEdit,
        dateDebut: editFormData.dateDebut,
        dateFin: editFormData.dateFin,
        description: editFormData.description,
      };
      const response = await axios.put(`/api/reservations/${reservationToEdit.id}`, updatedReservation);
      setReservations(reservations.map(res => res.id === response.data.id ? response.data : res));
      setIsEditModalOpen(false);
      setReservationToEdit(null);
    } catch (error) {
      console.error('Error saving reservation:', error);
       setError('Erreur lors de l\'enregistrement de la réservation');
    }
  };


  const filteredReservations = reservations.filter(reservation => {
    // Location filter
    if (selectedLocation !== 'all' && reservation.salle.localisationNom !== selectedLocation) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && reservation.statut !== selectedStatus) {
      return false;
    }

    // Date filter
    const reservationDate = new Date(reservation.dateDebut);
    const now = new Date();
    if (dateFilter === 'past' && reservationDate >= now) {
      return false;
    }
    if (dateFilter === 'upcoming' && reservationDate < now) {
      return false;
    }

    return true;
  });

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
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Réservations</h2>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                title="Filtrer par localisation"
              >
                <option value="all">Toutes les localisations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.nom}>
                    {location.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                title="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRMEE">Confirmée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Filter Tabs (Pill style) */}
        <div className="bg-gray-100 rounded-full p-1 flex shadow-inner mb-6">
          <button
            onClick={() => setDateFilter('all')}
            className={`flex-1 px-6 py-2 text-sm font-medium text-center rounded-full transition-colors
              ${dateFilter === 'all'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-800'
              }`}
            aria-label="Afficher toutes les réservations"
          >
            Toutes
          </button>
          <button
            onClick={() => setDateFilter('upcoming')}
            className={`flex-1 px-6 py-2 text-sm font-medium text-center rounded-full transition-colors
              ${dateFilter === 'upcoming'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-800'
              }`}
            aria-label={`Afficher les réservations à venir${dateFilter === 'upcoming' && filteredReservations.length > 0 ? ` (${filteredReservations.length})` : ''}`}
          >
            À venir {dateFilter === 'upcoming' && filteredReservations.length > 0 && `(${filteredReservations.length})`}
          </button>
          <button
            onClick={() => setDateFilter('past')}
            className={`flex-1 px-6 py-2 text-sm font-medium text-center rounded-full transition-colors
              ${dateFilter === 'past'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-800'
              }`}
            aria-label="Afficher les réservations passées"
          >
            Passées
          </button>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.salle.nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.salle.localisationNom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.utilisateur.nom} {reservation.utilisateur.prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.utilisateur.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.dateDebut).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.dateFin).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.description || 'Aucune description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' : 
                        reservation.statut === 'ANNULEE' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {reservation.statut === 'EN_ATTENTE' ? 'En attente' :
                       reservation.statut === 'CONFIRMEE' ? 'Confirmée' :
                       'Annulée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                    {reservation.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'CONFIRMEE')}
                          className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                          title="Confirmer la réservation"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'ANNULEE')}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                           title="Annuler la réservation"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                    {reservation.statut === 'CONFIRMEE' && (
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'ANNULEE')}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                         title="Annuler la réservation"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                      </button>
                    )}
                     <button
                        onClick={() => handleEditReservation(reservation)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="Modifier la réservation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer la réservation"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 4a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Edit Modal */}
      {isEditModalOpen && reservationToEdit && (
        <div className="fixed inset-0 bg-black/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 w-[500px] bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Modifier la Réservation</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                title="Fermer le modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salle</label>
                 <input
                   type="text"
                   className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                   value={`${reservationToEdit.salle.nom} (${reservationToEdit.salle.localisationNom})`}
                   disabled
                   title="Salle"
                 />
               </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
                 <input
                   type="text"
                   className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                   value={`${reservationToEdit.utilisateur.nom} ${reservationToEdit.utilisateur.prenom} (${reservationToEdit.utilisateur.email})`}
                   disabled
                   title="Utilisateur"
                 />
               </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.dateDebut}
                  onChange={(e) => setEditFormData({ ...editFormData, dateDebut: e.target.value })}
                  title="Date de début"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.dateFin}
                  onChange={(e) => setEditFormData({ ...editFormData, dateFin: e.target.value })}
                  title="Date de fin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[100px] resize-y"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  title="Description"
                ></textarea>
              </div>
               {/* Status can be changed using the table buttons, not directly in this modal */}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                title="Annuler"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEditedReservation}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                title="Enregistrer les modifications"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReservations; 