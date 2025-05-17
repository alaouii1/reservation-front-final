import { api } from '../api/axios';
import type { Reservation } from '../types/Reservation';

const USER_ID = 1; // TODO: Get this from authentication context

export const getAllReservations = async (date?: Date) => {
  try {
    console.log('Fetching all reservations...');
    // Always use the base endpoint for now
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
      // Use local date string (YYYY-MM-DD)
      const dateStr = date.toLocaleDateString('en-CA');
      console.log('Filtering reservations for date:', dateStr);
      
      const filteredReservations = response.data.filter(reservation => {
        const reservationDate = reservation.dateDebut.split('T')[0];
        console.log('Comparing dates:', {
          selectedDate: dateStr,
          reservationDate,
          matches: reservationDate === dateStr
        });
        return reservationDate === dateStr;
      });
      
      console.log('Filtered reservations:', filteredReservations);
      return filteredReservations;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all reservations:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export const getUserReservations = async () => {
  try {
    console.log('Making API request to:', `/reservations/user/${USER_ID}`);
    const response = await api.get<Reservation[]>(`/reservations/user/${USER_ID}`);
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
    throw error;
  }
};

export const cancelReservation = (id: number) => 
  api.delete(`/reservations/${id}`);

export const getNextReservation = () => 
  api.get<Reservation>(`/reservations/next/${USER_ID}`);

export const createReservation = (data: {
  salleId: number;
  dateDebut: string;
  dateFin: string;
  utilisateurId: number;
  statut: string;
  description: string;
}) => 
  api.post<Reservation>(`/reservations`, data);