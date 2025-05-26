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

  const handleDeleteRoom = async (roomId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      try {
        console.log('Deleting room:', roomId);
        await axios.delete(`/api/salles/${roomId}`);
        setRooms(rooms.filter(room => room.id !== roomId));
      } catch (error) {
        console.error('Error deleting room:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
        }
        setError('Erreur lors de la suppression de la salle');
      }
    }
  };

  const handleAddLocation = async () => {
    try {
      console.log('Adding new location:', newLocation);
      const createdLocation = await createLocalisation(newLocation.nom);
      console.log('Location added:', createdLocation);
      setLocations([...locations, createdLocation]);
      setNewLocation({ nom: '' });
      setIsLocationModalOpen(false);
    } catch (error) {
      console.error('Error adding location:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      setError('Erreur lors de l\'ajout de la localisation');
    }
  };

  const handleSaveRoom = async () => {
    try {
      console.log('Saving room:', currentRoom);
      if (currentRoom.id) {
        // Update existing room
        const response = await axios.put(`/api/salles/${currentRoom.id}`, currentRoom);
        console.log('Room updated:', response.data);
        setRooms(rooms.map(room => room.id === currentRoom.id ? response.data : room));
      } else {
        // Add new room
        const response = await axios.post('/api/salles', currentRoom);
        console.log('Room added:', response.data);
        setRooms([...rooms, response.data]);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Salles</h2>
        <button
          onClick={handleAddRoom}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Ajouter une Salle
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{room.nom}</td>
                <td className="px-6 py-4 text-gray-500">{room.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{room.localisationNom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-[500px] shadow-2xl rounded-lg bg-white/95 backdrop-blur-sm">
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

            <div className="space-y-6">
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
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={currentRoom.localisationNom || ''}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, localisationNom: e.target.value })}
                  >
                    <option value="">Sélectionner une localisation</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.nom}>
                        {location.nom}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nouvelle
                  </button>
                </div>
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {currentRoom.id ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/30 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 w-[400px] bg-white rounded-lg shadow-lg">
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