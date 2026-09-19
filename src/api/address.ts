import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { Address, CreateAddressPayload } from '../types/address.types';

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get(ServerStrings.addresses);
    const data = response.data?.data || response.data;
    const list = Array.isArray(data) ? data : [];
    return list.map((a: any) => ({
      id: Number(a.id || 0),
      title: a.title || 'Home',
      recipientName: a.recipient_name || '',
      recipientPhone: a.recipient_phone || '',
      countryId: a.country_id,
      countryName: a.country_name,
      city: a.city || '',
      street: a.street || '',
      district: a.district,
      postalCode: a.postal_code,
      fullAddress: a.full_address || `${a.city || ''}, ${a.street || ''}`,
      buildingNumber: a.building_number,
      floor: a.floor,
      apartment: a.apartment,
      landmark: a.landmark,
      notes: a.notes,
      latitude: Number(a.latitude || 24.7136),
      longitude: Number(a.longitude || 46.6753),
      isDefault: Boolean(a.is_default),
    }));
  },

  createAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    const body = {
      title: payload.title || 'Home',
      recipient_name: payload.recipient_name || payload.recipientName || '',
      recipient_phone: payload.recipient_phone || payload.recipientPhone || '',
      city: payload.city,
      street: payload.street,
      latitude: payload.latitude ?? 24.7136,
      longitude: payload.longitude ?? 46.6753,
      is_default: payload.is_default ?? payload.isDefault ?? false,
    };
    const response = await apiClient.post(ServerStrings.addresses, body);
    const a = response.data?.data || response.data;
    return {
      id: Number(a.id || 0),
      title: a.title || 'Home',
      recipientName: a.recipient_name || a.recipientName || '',
      recipientPhone: a.recipient_phone || a.recipientPhone || '',
      city: a.city || '',
      street: a.street || '',
      latitude: Number(a.latitude || 24.7136),
      longitude: Number(a.longitude || 46.6753),
      isDefault: Boolean(a.is_default || a.isDefault),
    };
  },


  updateAddress: async (id: number, payload: Partial<CreateAddressPayload>): Promise<Address> => {
    const response = await apiClient.put(ServerStrings.addressById(id), payload);
    const a = response.data?.data || response.data;
    return {
      id: Number(a.id || id),
      title: a.title || 'Home',
      recipientName: a.recipient_name || '',
      recipientPhone: a.recipient_phone || '',
      city: a.city || '',
      street: a.street || '',
      latitude: Number(a.latitude || 24.7136),
      longitude: Number(a.longitude || 46.6753),
      isDefault: Boolean(a.is_default),
    };
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(ServerStrings.addressById(id));
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await apiClient.post(ServerStrings.setDefaultAddress(id));
  },
};