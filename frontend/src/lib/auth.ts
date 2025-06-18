import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from './api';

export interface User {
  id: string;
  email: string;
  businessName: string;
  whatsappPhoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, businessName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: { businessName?: string; whatsappPhoneNumber?: string }) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, accessToken } = response.data;
          
          // Store token in cookie
          Cookies.set('whatsapp_ai_token', accessToken, { 
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          throw new Error(errorMessage);
        }
      },

      register: async (email: string, password: string, businessName: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, password, businessName });
          const { user, accessToken } = response.data;
          
          // Store token in cookie
          Cookies.set('whatsapp_ai_token', accessToken, { 
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (logoutError) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', logoutError);
        } finally {
          // Clear token and state
          Cookies.remove('whatsapp_ai_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      fetchUser: async () => {
        const token = Cookies.get('whatsapp_ai_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authApi.me();
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch {
          // Token is invalid, clear it
          Cookies.remove('whatsapp_ai_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (data: { businessName?: string; whatsappPhoneNumber?: string }) => {
        set({ isLoading: true });
        try {
          const response = await authApi.updateProfile(data);
          set({ 
            user: response.data.user, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Profile update failed';
          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: 'whatsapp-ai-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);