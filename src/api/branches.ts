import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { Branch } from '../types/branch.types';

export const branchesApi = {
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await apiClient.get(ServerStrings.branches);
      const data = response.data?.data || response.data || [];
      return (Array.isArray(data) ? data : []).map((b: any) => ({
        id: Number(b.id),
        name: b.name || '',
        code: b.code || '',
        address: b.address || '',
        city: b.city || '',
        phone: b.phone || '',
        openingHours: b.opening_hours || b.openingHours || '08:00 AM - 11:00 PM',
        latitude: b.latitude,
        longitude: b.longitude,
      }));
    } catch (err) {
      console.error('Failed to load branches:', err);
      return [];
    }
  },
};
