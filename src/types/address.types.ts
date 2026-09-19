export interface Address {
  id: number;
  title: string; // 'Home' | 'Work' | 'Other'
  recipientName: string;
  recipientPhone: string;
  countryId?: number;
  countryName?: string;
  city: string;
  street: string;
  district?: string;
  postalCode?: string;
  fullAddress?: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  title?: string;
  recipientName?: string;
  recipient_name?: string;
  recipientPhone?: string;
  recipient_phone?: string;
  country_id?: number;
  countryId?: number;
  city: string;
  street: string;
  district?: string;
  postal_code?: string;
  full_address?: string;
  building_number?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  isDefault?: boolean;
}