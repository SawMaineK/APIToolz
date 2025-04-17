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
}

export interface AuthModel {
  access_token: string;
  refreshToken?: string;
  api_token: string;
}

export interface UserModel {
  id: number;
  name: string;
  username?: string;
  password?: string | undefined;
  email: string;
  first_name?: string;
  last_name?: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  avatar?: string;
  roles?: number[];
  pic?: string;
  language?: TLanguageCode;
  auth?: AuthModel;
}

export class TwoFactorAuthError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'TwoFactorAuthError';
  }
}
