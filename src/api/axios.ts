// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Use relative path to work with Vite's proxy
});
