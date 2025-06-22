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
  initializeAuth: () => void;
  updateProfile: (data: { businessName?: string; whatsappPhoneNumber?: string }) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, accessToken } = response.data.data;
          
          // Store token in secure cookie
          Cookies.set('whatsapp_ai_token', accessToken, { 
            expires: 1, // 1 day for security
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: false, // Must be false for JS access, but we'll clear on suspicious activity
          });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          // Clear any existing tokens on login failure for security
          Cookies.remove('whatsapp_ai_token');
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          throw new Error(errorMessage);
        }
      },

      register: async (email: string, password: string, businessName: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, password, businessName });
          const { user, accessToken } = response.data.data;
          
          // Store token in secure cookie
          Cookies.set('whatsapp_ai_token', accessToken, { 
            expires: 1, // 1 day for security
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: false, // Must be false for JS access, but we'll clear on suspicious activity
          });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          // Clear any existing tokens on registration failure for security
          Cookies.remove('whatsapp_ai_token');
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

      initializeAuth: () => {
        const token = Cookies.get('whatsapp_ai_token');
        const state = get();
        
        // If we have a token but no authentication state, fetch user
        if (token && !state.isAuthenticated && !state.isLoading) {
          set({ isLoading: true });
          get().fetchUser();
        } else if (!token && state.isAuthenticated) {
          // If no token but we think we're authenticated, clear state
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      fetchUser: async () => {
        const token = Cookies.get('whatsapp_ai_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          const response = await authApi.me();
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.warn('Failed to fetch user, clearing auth state:', error.response?.status);
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