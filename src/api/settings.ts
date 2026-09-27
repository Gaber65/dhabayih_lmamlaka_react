import { apiClient } from './client';
import { ServerStrings } from './endpoints';

export interface PublicSettings {
  whatsapp: {
    enabled: boolean;
    phone: string;
    number: string;
    default_message: string;
    chat_url: string;
  };
  support_phone?: string;
  delivery_fee?: number;
}

export const settingsApi = {
  getPublicSettings: async (): Promise<PublicSettings> => {
    try {
      const response = await apiClient.get(ServerStrings.publicSettings);
      const data = response.data?.data || response.data;
      return data;
    } catch (err) {
      console.error('Failed to load public settings:', err);
      return {
        whatsapp: {
          enabled: true,
          phone: '+966500000000',
          number: '+966500000000',
          default_message: 'مرحباً، أود الاستفسار عن ذبائح المملكة',
          chat_url: 'https://wa.me/966500000000',
        },
        support_phone: '920000000',
        delivery_fee: 31.95,
      };
    }
  },
};
