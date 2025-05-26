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
    <div className="p-6 max-w-7xl mx-auto">
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
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{location.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3 justify-end">
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-md hover:bg-indigo-50 flex items-center justify-center"
                    title="Modifier"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
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
                {currentLocation.id ? 'Modifier la Localisation' : 'Ajouter une Localisation'}
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
                {currentLocation.id ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLocations; 