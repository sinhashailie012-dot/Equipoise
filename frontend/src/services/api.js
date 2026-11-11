import axios from 'axios';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('equipoise_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status === 401 && request && !request._retry &&
        !request.url?.includes('/auth/login') && !request.url?.includes('/auth/refresh')) {
      request._retry = true;
      const refreshToken = localStorage.getItem('equipoise_refresh_token');
      if (refreshToken) {
        try {
          const response = await refreshClient.post('/auth/refresh', { refreshToken });
          localStorage.setItem('equipoise_token', response.data.token);
          request.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(request);
        } catch {
          localStorage.removeItem('equipoise_refresh_token');
        }
      }
      localStorage.removeItem('equipoise_token');
      localStorage.removeItem('equipoise_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
