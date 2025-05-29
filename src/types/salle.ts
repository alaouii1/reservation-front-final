export interface SalleResponseDTO {
  id: number;
  nom: string;
  description: string;
  localisationNom: string;
  dispo: boolean;
}

export interface SalleRequestDTO {
  nom: string;
  description: string;
  localisationNom: string;
  dispo: boolean;
}