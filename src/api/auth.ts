import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { User } from '../types/auth.types';

export const authApi = {
  login: async (email: string) => {
    const response = await apiClient.post(ServerStrings.login, { email });
    return response.data;
  },

  register: async (email: string) => {
    const response = await apiClient.post(ServerStrings.register, { email });
    return response.data;
  },

  verifyLoginOtp: async (email: string, otp: string) => {
    const response = await apiClient.post(ServerStrings.loginVerify, { email, otp });
    const data = response.data?.data || response.data;
    const user: User = {
      id: data.id ?? 1,
      name: data.name || email.split('@')[0],
      email: data.email || email,
      phone: data.phone || '',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userType: data.user_type || 'customer',
      avatarUrl: data.avatar_url || '',
    };
    return { user, accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  verifyRegisterOtp: async (email: string, otp: string) => {
    const response = await apiClient.post(ServerStrings.registerVerify, { email, otp });
    const data = response.data?.data || response.data;
    const user: User = {
      id: data.id ?? 1,
      name: data.name || email.split('@')[0],
      email: data.email || email,
      phone: data.phone || '',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userType: data.user_type || 'customer',
      avatarUrl: data.avatar_url || '',
    };
    return { user, accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  getMe: async () => {
    const response = await apiClient.get(ServerStrings.profile);
    const data = response.data?.data || response.data;
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post(ServerStrings.logout);
    } catch {
      // ignore
    }
  },
};