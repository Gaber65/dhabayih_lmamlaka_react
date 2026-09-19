export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  userType: string;
  status: string;
  preferredLanguage: string;
  preferredTheme: string;
  pushNotificationsEnabled: boolean;
  loyaltyPoints: number;
  defaultAddress?: {
    id: number;
    title: string;
    city: string;
    street: string;
  } | null;
}