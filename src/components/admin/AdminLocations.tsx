import React, { useState, useEffect } from 'react';
import { getAllLocalisations, createLocalisation, updateLocalisation, deleteLocalisation, type Localisation } from '../../services/localisationService';

function AdminLocations() {
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Localisation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleEditLocation = (location: Localisation) => {
    setCurrentLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette localisation ?')) {
      try {
        await deleteLocalisation(id);
        setLocations(locations.filter(loc => loc.id !== id));
      } catch (error) {
        console.error('Error deleting location:', error);
        setError('Erreur lors de la suppression de la localisation');
      }
    }
  };

  const handleSaveLocation = async () => {
    try {
      if (currentLocation.id) {
        // Update existing location
        const updatedLocation = await updateLocalisation(currentLocation.id, currentLocation.nom || '');
        setLocations(locations.map(loc => loc.id === currentLocation.id ? updatedLocation : loc));
      } else {
        // Add new location
        const newLocation = await createLocalisation(currentLocation.nom || '');
        setLocations([...locations, newLocation]);
      }
      setIsModalOpen(false);
      setCurrentLocation({});
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Erreur lors de l\'enregistrement de la localisation');
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Localisations</h2>
        <button
          onClick={handleAddLocation}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Ajouter une Localisation
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{location.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
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

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentLocation.id ? 'Modifier la Localisation' : 'Ajouter une Localisation'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={currentLocation.nom || ''}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, nom: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-7 py-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentLocation({});
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveLocation}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLocations; 