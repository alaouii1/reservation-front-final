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
  const [nameFilter, setNameFilter] = useState<string>('');

  // Define available roles
  const availableRoles = ['PROFESSOR', 'ADMIN'];

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Utilisateur | null>(null);
  const [editFormData, setEditFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: '' as Utilisateur['role'],
    status: '' as UserStatus,
  });

  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // console.log('Fetching users...'); // Commented out to reduce console noise

        const usersResponse = await axios.get('http://localhost:8080/api/utilisateurs');
        // console.log('Users response:', usersResponse.data); // Commented out

        if (Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        } else {
          // console.error('Invalid users data format:', usersResponse.data); // Commented out
          setError('Format de données invalide pour les utilisateurs');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        if (axios.isAxiosError(error)) {
          // console.error('Error response:', error.response?.data); // Commented out
          // console.error('Error status:', error.response?.status); // Commented out
        }
        setError('Erreur lors du chargement des données des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/utilisateurs/${userId}/status`, { status: newStatus });
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      ));
      // console.log(`User ${userId} status updated to ${newStatus}`); // Commented out to reduce console noise
      showNotification(`Statut utilisateur mis à jour avec succès`, 'success');

    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Erreur lors de la mise à jour du statut');
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    showConfirmModal(
      'Supprimer l\'utilisateur',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      async () => {
        try {
          await axios.delete(`http://localhost:8080/api/utilisateurs/${userId}`);
          setUsers(users.filter(user => user.id !== userId));
          showNotification('Utilisateur supprimé avec succès', 'success');
        } catch (error) {
          console.error('Error deleting user:', error);
          setError('Erreur lors de la suppression de l\'utilisateur');
          showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
        }
      },
      'danger'
    );
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
      // console.log(`User ${userId} role updated to ${newRole}`); // Commented out
      showNotification(`Rôle utilisateur mis à jour avec succès`, 'success');

    } catch (error) {
      console.error('Error updating user role:', error);
      // Handle error (e.g., show an error message)
      setError('Erreur lors de la mise à jour du rôle de l\'utilisateur');
      showNotification('Erreur lors de la mise à jour du rôle de l\'utilisateur', 'error');
    }
  };

  const handleEditUser = (user: Utilisateur) => {
    setUserToEdit(user);
    setEditFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedUser = async () => {
    if (!userToEdit) return; // Should not happen if the modal is open

    try {
      // Call backend API to update the user
      // Replace with your actual API endpoint and payload structure
      const updatedUserData = {
        nom: editFormData.nom,
        prenom: editFormData.prenom,
        email: editFormData.email,
        password: '',
        role: editFormData.role,
        status: editFormData.status
      };

      const response = await axios.put(`http://localhost:8080/api/utilisateurs/${userToEdit.id}`, updatedUserData);

      // Update local state with the response data (which should be the updated user)
      setUsers(users.map(user =>
        user.id === response.data.id
          ? response.data
          : user
      ));
      showNotification('Utilisateur modifié avec succès', 'success');

      // Close modal after save
      setIsEditModalOpen(false);
      setUserToEdit(null);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Erreur lors de l\'enregistrement de l\'utilisateur');
      showNotification('Erreur lors de l\'enregistrement de l\'utilisateur', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    // Status filter
    if (filterStatus !== 'all' && user.status !== filterStatus) {
      return false;
    }

    // Name filter (case-insensitive search on full name)
    if (nameFilter && !`${user.nom} ${user.prenom}`.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculate counts for each status
  const allUsersCount = users.length;
  const confirmedUsersCount = users.filter(user => user.status === 'CONFIRMEE').length;
  const pendingUsersCount = users.filter(user => user.status === 'EN_ATTENTE').length;
  const rejectedUsersCount = users.filter(user => user.status === 'REJETE').length;

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
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
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
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* Name Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par nom
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Entrez le nom ou prénom..."
            title="Filtrer par nom ou prénom"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par statut
          </label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label={`Afficher tous les utilisateurs (${allUsersCount})`}
            >
              Tous ({allUsersCount})
            </button>
            <button
              onClick={() => setFilterStatus('CONFIRMEE')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'CONFIRMEE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label={`Afficher les utilisateurs confirmés (${confirmedUsersCount})`}
            >
              Confirmée ({confirmedUsersCount})
            </button>
            <button
              onClick={() => setFilterStatus('EN_ATTENTE')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'EN_ATTENTE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label={`Afficher les utilisateurs en attente (${pendingUsersCount})`}
            >
              En attente ({pendingUsersCount})
            </button>
            <button
              onClick={() => setFilterStatus('REJETE')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${filterStatus === 'REJETE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label={`Afficher les utilisateurs rejetés (${rejectedUsersCount})`}
            >
              Rejetée ({rejectedUsersCount})
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2 justify-end">
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
                    onClick={() => handleEditUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-md hover:bg-indigo-50"
                    title="Modifier l'utilisateur"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  </button>
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

      {/* User Edit Modal */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-black/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 w-[500px] bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Modifier l'utilisateur</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  title="Nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.prenom}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  title="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  value={editFormData.email}
                  disabled // Email is likely not editable
                  title="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Utilisateur['role'] })}
                  title="Rôle"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as UserStatus })}
                  title="Statut"
                >
                   <option value="EN_ATTENTE">En attente</option>
                   <option value="CONFIRMEE">Confirmée</option>
                   <option value="REJETE">Rejetée</option>
                </select>
              </div>
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
                onClick={handleSaveEditedUser}
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

export default AdminUsers; 