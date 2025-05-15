import axios from 'axios';
import type { SalleResponseDTO, SalleRequestDTO } from '../types/salle';

const BASE_URL = '/api/salles';

export async function getAllSalles(): Promise<SalleResponseDTO[]> {
  const res = await axios.get<SalleResponseDTO[]>(BASE_URL);
  return res.data;
}

export async function getSalleById(id: number): Promise<SalleResponseDTO> {
  const res = await axios.get<SalleResponseDTO>(`${BASE_URL}/${id}`);
  return res.data;
}

export async function createSalle(data: SalleRequestDTO): Promise<SalleResponseDTO> {
  const res = await axios.post<SalleResponseDTO>(BASE_URL, data);
  return res.data;
}

export async function updateSalle(id: number, data: SalleRequestDTO): Promise<SalleResponseDTO> {
  const res = await axios.put<SalleResponseDTO>(`${BASE_URL}/${id}`, data);
  return res.data;
}

export async function deleteSalle(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}