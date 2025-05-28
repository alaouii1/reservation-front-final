export type UserStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'REJETE';

export interface Utilisateur {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    status: UserStatus;
    role: 'PROFESSOR' | 'ADMIN';
    
}
  