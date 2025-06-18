import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('whatsapp_ai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('whatsapp_ai_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; businessName: string }) =>
    api.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  logout: () => api.post('/api/auth/logout'),
  
  me: () => api.get('/api/auth/me'),
  
  updateProfile: (data: { businessName?: string; whatsappPhoneNumber?: string }) =>
    api.put('/api/auth/profile', data),
};

// Conversations API
export const conversationsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/conversations', { params }),
  
  get: (id: string) => api.get(`/api/conversations/${id}`),
  
  create: (data: { customerPhone: string; customerName?: string; aiEnabled?: boolean }) =>
    api.post('/api/conversations', data),
  
  update: (id: string, data: { aiEnabled?: boolean; customerName?: string }) =>
    api.put(`/api/conversations/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/conversations/${id}`),
  
  toggleAI: (id: string) => api.put(`/api/conversations/${id}/toggle-ai`),
  
  getMessages: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/conversations/${id}/messages`, { params }),
  
  sendMessage: (id: string, data: { content: string; messageType?: string }) =>
    api.post(`/api/conversations/${id}/messages`, data),
  
  getStats: () => api.get('/api/conversations/stats'),
  
  getAnalytics: () => api.get('/api/conversations/analytics/overview'),
  
  getRecentMessages: (limit?: number) =>
    api.get('/api/conversations/recent/messages', { params: { limit } }),
  
  searchMessages: (query: string, limit?: number) =>
    api.get('/api/conversations/search/messages', { params: { q: query, limit } }),
};

// Webhooks API
export const webhooksApi = {
  getLogs: (limit?: number) => api.get('/api/webhook/logs', { params: { limit } }),
  getStats: () => api.get('/api/webhook/stats'),
  health: () => api.get('/api/webhook/health'),
};

export default api;