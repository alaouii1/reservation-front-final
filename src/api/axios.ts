// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api', // adapt this to match your Spring Boot API
});
