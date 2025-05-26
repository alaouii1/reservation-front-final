// import { Salle } from "./Salle";
import type { Utilisateur } from "./Utilisateur";

export type ReservationStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';

export interface Reservation {
  id: number;
  dateDebut: string;
  dateFin: string;
  description: string;
  salle: {
    id: number;
    nom: string;
    description: string;
    localisationNom : string;
  };
  utilisateur: Utilisateur;
  statut: ReservationStatus;
}