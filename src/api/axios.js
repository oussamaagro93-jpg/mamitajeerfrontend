import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    if (error.response?.status !== 401) {
      console.error(error.response?.data?.message || 'Something went wrong');
    }

    return Promise.reject(error);
  },
);

export default api;
