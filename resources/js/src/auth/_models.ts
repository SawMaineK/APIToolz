import { type TLanguageCode } from '@/i18n';

export interface ApiResponse<T> {
  message: string;
  requires_2fa: boolean;
  data: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  phone: string;
  gender: string | null;
  dob: string | null;
  avatar: string;
  personal_access_token: string;
  roles: Role[];
}

export interface Role {
  name: string;
  guard_name: string;
}

export interface AuthModel {
  access_token: string;
  refreshToken?: string;
  api_token: string;
}

export class TwoFactorAuthError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'TwoFactorAuthError';
  }
}
