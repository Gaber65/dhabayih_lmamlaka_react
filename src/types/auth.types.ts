export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  accessToken?: string;
  refreshToken?: string;
  userType?: string;
  role?: string;
  isAdmin?: boolean;
  is_admin?: boolean;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
}