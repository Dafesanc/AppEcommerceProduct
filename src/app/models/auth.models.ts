export type UserRole = 'ADMIN' | 'CUSTOMER' | 'DISTRIBUTOR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  creditBalance: number;
  defaultDiscount: number;
  identificationType?: string;
  identificationNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CUSTOMER' | 'DISTRIBUTOR';
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
