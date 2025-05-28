import { api } from '../api/axios';
import type { Reservation } from '../types/Reservation';

const getUserId = (): number => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    throw new Error('User not found in localStorage');
  }

  try {
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      throw new Error('Invalid user data in localStorage');
    }
    return user.id;
  } catch (error) {
    throw new Error('Failed to parse user data from localStorage');
  }
};

export const getAllReservations = async (date?: Date) => {
  try {
    console.log('Fetching all reservations...');
    const response = await api.get<Reservation[]>('/reservations');
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    console.log('API Response data:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('API did not return an array:', response.data);
      return [];
    }
    
    // Filter reservations by date on the client side
    if (date) {
      const dateStr = date.toLocaleDateString('en-CA');
      console.log('Filtering reservations for date:', dateStr);
      
      const filteredReservations = response.data.filter(reservation => {
        const reservationDate = reservation.dateDebut.split('T')[0];
        console.log(`Comparing reservation date ${reservationDate} with selected date ${dateStr}`);
        return reservationDate === dateStr;
      });
      
      return filteredReservations;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all reservations:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error(error.response?.data?.message || 'Erreur lors du chargement des réservations');
  }
};

export const getUserReservations = async () => {
  try {
    const userId = getUserId();
    console.log('Making API request to:', `/reservations/user/${userId}`);
    const response = await api.get<Reservation[]>(`/reservations/user/${userId}`);
    console.log('Raw API Response:', response);
    
    if (!response.data) {
      console.error('No data in response');
      return { data: [] };
    }
    
    // Ensure we're returning an array
    const data = Array.isArray(response.data) ? response.data : [response.data];
    console.log('Processed reservations data:', data);
    
    return { data };
  } catch (error: any) {
    console.error('Error fetching user reservations:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw new Error(error.response?.data?.message || 'Erreur lors du chargement des réservations');
  }
};

export const cancelReservation = (id: number) => 
  api.delete(`/reservations/${id}`);

export const getNextReservation = () => {
  const userId = getUserId();
  return api.get<Reservation>(`/reservations/next/${userId}`);
};

export const createReservation = (data: {
  salleId: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  description: string;
}) => {
  const userId = getUserId();
  return api.post<Reservation>(`/reservations`, {
    ...data,
    utilisateurId: userId
  });
};