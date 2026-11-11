import axios from 'axios';
import {
  clearAccessToken,
  getAccessToken,
} from '@/modules/auth/services/tokenStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      clearAccessToken();
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
