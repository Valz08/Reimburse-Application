// src/utils/axios.js

import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 440) {
      clearToken();
      alert('Sesi habis. Silakan login ulang.');
      window.location.href = '/login-user';
    }
    return Promise.reject(err);
  }
);

export default api;
