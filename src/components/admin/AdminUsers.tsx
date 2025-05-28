import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Utilisateur, UserStatus } from '../../types/Utilisateur';

// Define a placeholder type for User data
// You will need to replace this with your actual User DTO type
// interface UserResponseDTO {
//   id: number;
//   nom: string;
//   prenom: string;
//   email: string;
//   role: string; // e.g., 'USER', 'ADMIN'
//   // Add other user properties as needed
// }

function AdminUsers() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');

  // Define available roles
  const availableRoles = ['PROFESSOR', 'ADMIN'];

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching users...');

        const usersResponse = await axios.get('http://localhost:8080/api/utilisateurs');
        console.log('Users response:', usersResponse.data);

        if (Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        } else {
          console.error('Invalid users data format:', usersResponse.data);
          setError('Format de données invalide pour les utilisateurs');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
        }
        setError('Erreur lors du chargement des données des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/utilisateurs/${userId}/status`, { status: newStatus });
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/utilisateurs/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  // New function to handle role change
  const handleRoleChange = async (userId: number, newRole: Utilisateur['role']) => {
    try {
      // Call backend API to update the role
      // Replace with your actual API endpoint and payload structure
      await axios.patch(`http://localhost:8080/api/utilisateurs/${userId}/role`, { role: newRole });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      console.log(`User ${userId} role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      // Handle error (e.g., show an error message)
      setError('Erreur lors de la mise à jour du rôle de l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterStatus === 'all') {
      return true;
    }
    return user.status === filterStatus;
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMEE')}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'CONFIRMEE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Confirmée
          </button>
          <button
            onClick={() => setFilterStatus('EN_ATTENTE')}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'EN_ATTENTE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilterStatus('REJETE')}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'REJETE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Rejetée
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.prenom}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Ensure the authenticated user is not changing their own role if they are admin */}
                  {/* You might need to pass the current admin user's ID or a flag here */}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Utilisateur['role'])}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Changer le rôle de l'utilisateur"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'CONFIRMEE' ? 'bg-green-100 text-green-800' : 
                      user.status === 'REJETE' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {user.status === 'EN_ATTENTE' ? 'En attente' :
                     user.status === 'CONFIRMEE' ? 'Confirmée' :
                     'Rejetée'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                  {user.status === 'EN_ATTENTE' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(user.id, 'CONFIRMEE')}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                        title="Confirmer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStatusChange(user.id, 'REJETE')}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Rejeter"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
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
    </div>
  );
}

export default AdminUsers; 