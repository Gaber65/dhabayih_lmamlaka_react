import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { UserProfile } from '../types/profile.types';

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(ServerStrings.profile);
    const data = response.data?.data || response.data || {};
    return {
      id: Number(data.id || 0),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url || data.avatar || '',
      userType: data.user_type || 'customer',
      status: data.status || 'active',
      preferredLanguage: data.preferred_language || 'ar',
      preferredTheme: data.preferred_theme || 'light',
      pushNotificationsEnabled: data.push_notifications_enabled !== false,
      loyaltyPoints: Number(data.loyalty_points || 0),
      defaultAddress: data.default_address ? {
        id: Number(data.default_address.id || 0),
        title: data.default_address.title || '',
        city: data.default_address.city || '',
        street: data.default_address.street || '',
      } : null,
    };
  },

  updateProfile: async (payload: {
    name?: string;
    phone?: string;
    preferredLanguage?: string;
    preferredTheme?: string;
    pushNotificationsEnabled?: boolean;
  }): Promise<UserProfile> => {
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.phone !== undefined) body.phone = payload.phone;
    if (payload.preferredLanguage !== undefined) body.preferred_language = payload.preferredLanguage;
    if (payload.preferredTheme !== undefined) body.preferred_theme = payload.preferredTheme;
    if (payload.pushNotificationsEnabled !== undefined) body.push_notifications_enabled = payload.pushNotificationsEnabled;

    const response = await apiClient.put(ServerStrings.updateProfile, body);
    const data = response.data?.data || response.data;
    return {
      id: Number(data.id || 0),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url || '',
      userType: data.user_type || 'customer',
      status: data.status || 'active',
      preferredLanguage: data.preferred_language || 'ar',
      preferredTheme: data.preferred_theme || 'light',
      pushNotificationsEnabled: data.push_notifications_enabled !== false,
      loyaltyPoints: Number(data.loyalty_points || 0),
      defaultAddress: data.default_address,
    };
  },
};