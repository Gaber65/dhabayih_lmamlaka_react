import { create } from 'zustand';
import { User, AuthState } from '../types/auth.types';
import { authApi } from '../api/auth';

interface AuthStore extends AuthState {
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  setGuest: (isGuest: boolean) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,

  initAuth: () => {
    try {
      const token = localStorage.getItem('dhabayih_access_token');
      const refreshToken = localStorage.getItem('dhabayih_refresh_token');
      const userStr = localStorage.getItem('dhabayih_user');
      const isGuestStr = localStorage.getItem('dhabayih_is_guest');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
      } else if (isGuestStr === 'true') {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isGuest: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setAuth: (user: User, accessToken: string, refreshToken?: string) => {
    localStorage.setItem('dhabayih_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('dhabayih_refresh_token', refreshToken);
    }
    localStorage.setItem('dhabayih_user', JSON.stringify(user));
    localStorage.removeItem('dhabayih_is_guest');

    set({
      user,
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
      isGuest: false,
    });
  },

  setGuest: (isGuest: boolean) => {
    if (isGuest) {
      localStorage.setItem('dhabayih_is_guest', 'true');
    } else {
      localStorage.removeItem('dhabayih_is_guest');
    }
    set({ isGuest, isAuthenticated: false, user: null, accessToken: null });
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('dhabayih_access_token');
    localStorage.removeItem('dhabayih_refresh_token');
    localStorage.removeItem('dhabayih_user');
    localStorage.removeItem('dhabayih_is_guest');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,
    });
  },
}));