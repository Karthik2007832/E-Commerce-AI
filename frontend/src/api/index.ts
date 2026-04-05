import axios from 'axios';
import { useAuthStore } from '@/store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api',
});


// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    // We cannot use hooks here, but we can access the zustand store directly
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const productApi = {
  getProducts: (q?: string, page: number = 1, limit: number = 20) => 
    api.get(`/products?q=${q || ''}&page=${page}&limit=${limit}`),
  getProduct: (id: string | number) => api.get(`/products/${id}`),
};

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (user: any) => api.post('/auth/register', user),
};

export const interactionApi = {
  logInteraction: (data: any) => api.post('/interactions/log', data),
  getViewed: (userId: string) => api.get(`/interactions/viewed/${userId}`),
};

export const mlApi = {
  getRecommendations: (userId: string, excludeIds: number[] = [], lastProductId?: number) => 
    api.get(`/recommendations/${userId}?last_product_id=${lastProductId || ''}&exclude_ids=${excludeIds.join(',')}`),
};

export const orderApi = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
};

export default api;
