import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role: 'USER' | 'FARMER' | 'DRIVER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    await SecureStore.setItemAsync('token', token);
    set({ user, token, isLoading: false });
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    await SecureStore.setItemAsync('token', token);
    set({ user, token, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const res = await api.get('/users/profile');
        set({ user: res.data, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await SecureStore.deleteItemAsync('token');
      }
      set({ isLoading: false });
    }
  },
}));
