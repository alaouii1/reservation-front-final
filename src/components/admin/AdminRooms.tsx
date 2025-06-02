import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { SalleResponseDTO } from '../../types/salle';
import { getAllLocalisations, createLocalisation, type Localisation } from '../../services/localisationService';

function AdminRooms() {
  const [rooms, setRooms] = useState<SalleResponseDTO[]>([]);
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<SalleResponseDTO>>({});
  const [newLocation, setNewLocation] = useState({ nom: '' });
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

  // Filter and Search states
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispo, setSelectedDispo] = useState<string>('all'); // 'all', 'available', 'unavailable'

  // Fetch rooms and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching rooms and locations...');
        
        // Fetch rooms
        const roomsResponse = await axios.get('/api/salles');
        console.log('Rooms response:', roomsResponse.data);
        
        if (Array.isArray(roomsResponse.data)) {
          setRooms(roomsResponse.data);
        } else {
          console.error('Invalid rooms data format:', roomsResponse.data);
          setError('Format de données invalide pour les salles');
        }

        // Fetch locations
        try {
          const locationsData = await getAllLocalisations();
          console.log('Locations response:', locationsData);
          setLocations(locationsData);
        } catch (locationError) {
          console.error('Error fetching locations:', locationError);
          // Don't set error state for locations, just log it
          // This allows the rooms to still be displayed even if locations fail
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
        }
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRoom = () => {
    console.log('Opening room modal...');
    setCurrentRoom({});
    setIsModalOpen(true);
  };

  const handleEditRoom = (room: SalleResponseDTO) => {
    console.log('Editing room:', room);
    setCurrentRoom(room);
    setIsModalOpen(true);
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

  const handleDeleteRoom = async (roomId: number) => {
    showConfirmModal(
      'Supprimer la salle',
      'Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est irréversible.',
      async () => {
        try {
          console.log('Deleting room:', roomId);
          await axios.delete(`/api/salles/${roomId}`);
          setRooms(rooms.filter(room => room.id !== roomId));
          showNotification('Salle supprimée avec succès', 'success');
        } catch (error) {
          console.error('Error deleting room:', error);
          if (axios.isAxiosError(error)) {
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
          }
          setError('Erreur lors de la suppression de la salle');
          showNotification('Erreur lors de la suppression de la salle', 'error');
        }
      },
      'danger'
    );
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddLocation = async () => {
    try {
      console.log('Adding new location:', newLocation);
      const createdLocation = await createLocalisation(newLocation.nom);
      console.log('Location added:', createdLocation);
      setLocations([...locations, createdLocation]);
      setNewLocation({ nom: '' });
      setIsLocationModalOpen(false);
      showNotification('Localisation ajoutée avec succès', 'success');
    } catch (error) {
      console.error('Error adding location:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      setError('Erreur lors de l\'ajout de la localisation');
      showNotification('Erreur lors de l\'ajout de la localisation', 'error');
    }
  };

  const handleSaveRoom = async () => {
    try {
      // Vérifier si une localisation est sélectionnée
      if (!currentRoom.localisationNom) {
        showNotification('Veuillez sélectionner une localisation', 'error');
        return;
      }

      console.log('Saving room:', currentRoom);
      if (currentRoom.id) {
        // Update existing room
        const response = await axios.put(`/api/salles/${currentRoom.id}`, currentRoom);
        console.log('Room updated:', response.data);
        setRooms(rooms.map(room => room.id === currentRoom.id ? response.data : room));
        showNotification('Salle modifiée avec succès', 'success');
      } else {
        // Add new room
        const response = await axios.post('/api/salles', currentRoom);
        console.log('Room added:', response.data);
        setRooms([...rooms, response.data]);
        showNotification('Salle ajoutée avec succès', 'success');
      }
      setIsModalOpen(false);
      setCurrentRoom({});
    } catch (error) {
      console.error('Error saving room:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      setError('Erreur lors de l\'enregistrement de la salle');
      showNotification('Erreur lors de l\'enregistrement de la salle', 'error');
    }
  };

  const handleToggleDispo = async (room: SalleResponseDTO) => {
    const newStatus = !room.dispo;
    showConfirmModal(
      'Changer la disponibilité',
      `Êtes-vous sûr de vouloir marquer cette salle comme ${newStatus ? 'disponible' : 'indisponible'} ?`,
      async () => {
        try {
          const updatedRoom = { ...room, dispo: newStatus };
          const response = await axios.put(`/api/salles/${room.id}`, updatedRoom);
          setRooms(rooms.map(r => r.id === room.id ? response.data : r));
          showNotification(`Salle marquée comme ${newStatus ? 'disponible' : 'indisponible'}`, 'success');
        } catch (error) {
          console.error('Error toggling room availability:', error);
          setError('Erreur lors de la modification de la disponibilité');
          showNotification('Erreur lors de la modification de la disponibilité', 'error');
        }
      }
    );
  };

  const filteredRooms = rooms.filter(room => {
    const matchesLocation = selectedLocation === 'all' || room.localisationNom === selectedLocation;
    const matchesSearch = room.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDispo = 
      selectedDispo === 'all' ||
      (selectedDispo === 'available' && room.dispo) ||
      (selectedDispo === 'unavailable' && !room.dispo);
    return matchesLocation && matchesSearch && matchesDispo;
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Salles</h1>
        <div className="flex gap-4">
          <button
            onClick={handleAddRoom}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Ajouter Salle
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par localisation
            </label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              title="Filtrer les salles par localisation"
            >
              <option value="all">Toutes les localisations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.nom}>
                  {location.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher par nom
            </label>
            <input
              type="text"
              placeholder="Entrez le nom de la salle..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              title="Rechercher les salles par nom"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par disponibilité
            </label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={selectedDispo}
              onChange={(e) => setSelectedDispo(e.target.value)}
              title="Filtrer les salles par disponibilité"
            >
              <option value="all">Toutes les disponibilités</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{room.nom}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{room.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{room.localisationNom}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleDispo(room)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      room.dispo
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    title={room.dispo ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
                  >
                    {room.dispo ? 'Disponible' : 'Indisponible'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-md hover:bg-indigo-50 flex items-center justify-center"
                      title="Modifier la salle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50 flex items-center justify-center"
                      title="Supprimer la salle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 4a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 w-[500px] bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                {currentRoom.id ? 'Modifier la Salle' : 'Ajouter une Salle'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentRoom({});
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Salle
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Entrez le nom de la salle"
                  value={currentRoom.nom || ''}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, nom: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[100px] resize-y"
                  placeholder="Entrez la description de la salle"
                  value={currentRoom.description || ''}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={currentRoom.localisationNom || ''}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, localisationNom: e.target.value })}
                  title="Sélectionner une localisation"
                >
                  <option value="">Sélectionnez une localisation</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.nom}>
                      {location.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={currentRoom.dispo ?? false}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, dispo: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Disponible</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentRoom({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M5 13l4 4L19 7" clipRule="evenodd" />
                </svg>
                {currentRoom.id ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/30  overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 w-[400px] bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nouvelle Localisation
              </h3>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setNewLocation({ nom: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom de la localisation"
                value={newLocation.nom}
                onChange={(e) => setNewLocation({ nom: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setNewLocation({ nom: '' });
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleAddLocation}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRooms; 