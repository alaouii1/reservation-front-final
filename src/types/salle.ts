export interface SalleResponseDTO {
  id: number;
  nom: string;
  description: string;
  localisationNom: string;
}

export interface SalleRequestDTO {
  nom: string;
  description: string;
  localisationNom: string;
}