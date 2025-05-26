import axios from 'axios';

export interface Localisation {
  id: number;
  nom: string;
}

const BASE_URL = '/api/localisations';

export async function getAllLocalisations(): Promise<Localisation[]> {
  const response = await axios.get<Localisation[]>(BASE_URL);
  return response.data;
}

export async function createLocalisation(nom: string): Promise<Localisation> {
  const response = await axios.post<Localisation>(BASE_URL, { nom });
  return response.data;
}

export async function updateLocalisation(id: number, nom: string): Promise<Localisation> {
  const response = await axios.put<Localisation>(`${BASE_URL}/${id}`, { nom });
  return response.data;
}

export async function deleteLocalisation(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
} 