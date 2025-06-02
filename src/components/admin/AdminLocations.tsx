import React, { useState, useEffect } from 'react';
import { getAllLocalisations, createLocalisation, deleteLocalisation, type Localisation } from '../../services/localisationService';

function AdminLocations() {
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Localisation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLocalisations();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Erreur lors du chargement des localisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = () => {
    setCurrentLocation({});
    setIsModalOpen(true);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const showConfirmModal = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const handleDeleteLocation = async (nom: string) => {
    showConfirmModal(
      'Supprimer la localisation',
      'Êtes-vous sûr de vouloir supprimer cette localisation ? Cette action est irréversible.',
      async () => {
        try {
          await deleteLocalisation(nom);
          setLocations(locations.filter(loc => loc.nom !== nom));
          showNotification('Localisation supprimée avec succès', 'success');
        } catch (error) {
          console.error('Error deleting location:', error);
          setError('Erreur lors de la suppression de la localisation');
          showNotification('Erreur lors de la suppression de la localisation', 'error');
        }
      },
      'danger'
    );
  };

  const handleSaveLocation = async () => {
    try {
      const newLocation = await createLocalisation(currentLocation.nom || '');
      setLocations([...locations, newLocation]);
      showNotification('Localisation ajoutée avec succès', 'success');
      setIsModalOpen(false);
      setCurrentLocation({});
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Erreur lors de l\'enregistrement de la localisation');
      showNotification('Erreur lors de l\'enregistrement de la localisation', 'error');
    }
  };

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
    <div className="p-6 max-w-7xl mx-auto">
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

      {/* Confirmation Modal */}
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
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Localisations</h1>
        <button
          onClick={handleAddLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          Ajouter une Localisation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{location.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3 justify-end">
                  <button
                    onClick={() => handleDeleteLocation(location.nom)}
                    className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50 flex items-center justify-center"
                    title="Supprimer"
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

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 w-[400px] bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Ajouter une Localisation
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentLocation({});
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Localisation
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Entrez le nom de la localisation"
                  value={currentLocation.nom || ''}
                  onChange={(e) => setCurrentLocation({ ...currentLocation, nom: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentLocation({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveLocation}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M5 13l4 4L19 7" clipRule="evenodd" />
                </svg>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLocations; 