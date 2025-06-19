import axios from 'axios';
import Cookies from 'js-cookie';
import { mockApi, USE_MOCK_DATA } from './mock-data';

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

// Helper function to handle mock fallback
const withMockFallback = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> => {
  if (USE_MOCK_DATA) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return await mockCall();
    }
  }
  return await apiCall();
};

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; businessName: string }) =>
    withMockFallback(
      () => api.post('/api/auth/register', data),
      () => mockApi.auth.register(data.email, data.password, data.businessName)
    ),
  
  login: (data: { email: string; password: string }) =>
    withMockFallback(
      () => api.post('/api/auth/login', data),
      () => mockApi.auth.login(data.email, data.password)
    ),
  
  logout: () => api.post('/api/auth/logout'),
  
  me: () => 
    withMockFallback(
      () => api.get('/api/auth/me'),
      () => mockApi.auth.me()
    ),
  
  updateProfile: (data: { businessName?: string; whatsappPhoneNumber?: string }) =>
    api.put('/api/auth/profile', data),
};

// Conversations API
export const conversationsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    withMockFallback(
      () => api.get('/api/conversations', { params }),
      () => mockApi.conversations.list()
    ),
  
  get: (id: string) => 
    withMockFallback(
      () => api.get(`/api/conversations/${id}`),
      () => mockApi.conversations.get(id)
    ),
  
  create: (data: { customerPhone: string; customerName?: string; aiEnabled?: boolean }) =>
    api.post('/api/conversations', data),
  
  update: (id: string, data: { aiEnabled?: boolean; customerName?: string }) =>
    api.put(`/api/conversations/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/conversations/${id}`),
  
  toggleAI: (id: string) => 
    withMockFallback(
      () => api.put(`/api/conversations/${id}/toggle-ai`),
      () => mockApi.conversations.toggleAI(id)
    ),
  
  getMessages: (id: string, params?: { page?: number; limit?: number }) =>
    withMockFallback(
      () => api.get(`/api/conversations/${id}/messages`, { params }),
      () => mockApi.conversations.getMessages(id)
    ),
  
  sendMessage: (id: string, data: { content: string; messageType?: string }) =>
    api.post(`/api/conversations/${id}/messages`, data),
  
  getStats: () => 
    withMockFallback(
      () => api.get('/api/conversations/stats'),
      () => mockApi.conversations.getStats()
    ),
  
  getAnalytics: () => 
    withMockFallback(
      () => api.get('/api/conversations/analytics/overview'),
      () => mockApi.conversations.getAnalytics()
    ),
  
  getRecentMessages: (limit?: number) =>
    api.get('/api/conversations/recent/messages', { params: { limit } }),
  
  searchMessages: (query: string, limit?: number) =>
    api.get('/api/conversations/search/messages', { params: { q: query, limit } }),
};

// Webhooks API
export const webhooksApi = {
  getLogs: (limit?: number) => 
    withMockFallback(
      () => api.get('/api/webhook/logs', { params: { limit } }),
      () => mockApi.webhooks.getLogs()
    ),
  getStats: () => 
    withMockFallback(
      () => api.get('/api/webhook/stats'),
      () => mockApi.webhooks.getStats()
    ),
  health: () => api.get('/api/webhook/health'),
};

export default api;