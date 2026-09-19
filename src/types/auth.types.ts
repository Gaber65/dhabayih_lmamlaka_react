export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  accessToken?: string;
  refreshToken?: string;
  userType?: string;
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