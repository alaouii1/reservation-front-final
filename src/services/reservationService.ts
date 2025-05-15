import { api } from '../api/axios';
import type { Reservation } from '../types/Reservation';

const USER_ID = 1; // TODO: Get this from authentication context

export const getUserReservations = () => 
  api.get<Reservation[]>(`/reservations/user/${USER_ID}`);

export const cancelReservation = (id: number) => 
  api.delete(`/reservations/${id}`);

export const getNextReservation = () => 
  api.get<Reservation>(`/reservations/next/${USER_ID}`);

export const createReservation = (data: {
  salleId: number;
  dateDebut: string;
  dateFin: string;
}) => 
  api.post<Reservation>(`/reservations`, {
    ...data,
    userId: USER_ID
  });