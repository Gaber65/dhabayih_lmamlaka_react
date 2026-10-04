import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { User } from '../types/auth.types';

export const authApi = {
  login: async (identifier: string, channel?: string) => {
    const isPhone = !identifier.includes('@');
    const response = await apiClient.post(ServerStrings.login, {
      email: identifier,
      phone: identifier,
      identifier,
      channel: channel || (isPhone ? 'sms' : 'email'),
    });
    return response.data;
  },

  register: async (identifier: string, channel?: string) => {
    const isPhone = !identifier.includes('@');
    const response = await apiClient.post(ServerStrings.register, {
      email: identifier,
      phone: identifier,
      identifier,
      channel: channel || (isPhone ? 'sms' : 'email'),
    });
    return response.data;
  },

  verifyLoginOtp: async (identifier: string, otp: string) => {
    const response = await apiClient.post(ServerStrings.loginVerify, {
      email: identifier,
      phone: identifier,
      identifier,
      otp,
      code: otp,
    });
    const data = response.data?.data || response.data;
    const userObj = data.user || data;
    const user: User = {
      id: userObj.id ?? 1,
      name: userObj.name || (identifier.includes('@') ? identifier.split('@')[0] : identifier),
      email: userObj.email || (identifier.includes('@') ? identifier : ''),
      phone: userObj.phone || (!identifier.includes('@') ? identifier : ''),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userType: userObj.user_type || data.user_type || 'customer',
      avatarUrl: userObj.avatar_url || '',
    };
    return { user, accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  verifyRegisterOtp: async (identifier: string, otp: string) => {
    const response = await apiClient.post(ServerStrings.registerVerify, {
      email: identifier,
      phone: identifier,
      identifier,
      otp,
      code: otp,
    });
    const data = response.data?.data || response.data;
    const userObj = data.user || data;
    const user: User = {
      id: userObj.id ?? 1,
      name: userObj.name || (identifier.includes('@') ? identifier.split('@')[0] : identifier),
      email: userObj.email || (identifier.includes('@') ? identifier : ''),
      phone: userObj.phone || (!identifier.includes('@') ? identifier : ''),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userType: userObj.user_type || data.user_type || 'customer',
      avatarUrl: userObj.avatar_url || '',
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