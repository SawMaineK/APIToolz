/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type ApiResponse, type User, TwoFactorAuthError } from '@/auth';

const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/login`;
export const VERIFY_2FA_URL = `${API_URL}/verify-2fa`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: User | undefined;
  setCurrentUser: Dispatch<SetStateAction<User | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  verify2fa: (email: string, otp: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  const verify = async () => {
    if (auth) {
      try {
        const {
          data: { data: user }
        } = await getUser();
        setCurrentUser(user as User);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const verify2fa = async (email: string, otp: string) => {
    try {
      const {
        data: { data: token }
      } = await axios.post<ApiResponse<User>>(VERIFY_2FA_URL, {
        email,
        otp
      });

      const auth: AuthModel = {
        access_token: token.personal_access_token,
        api_token: token.personal_access_token,
        refreshToken: undefined
      };

      saveAuth(auth);
      const {
        data: { data: user }
      } = await getUser();
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const {
        data: { data: token, requires_2fa }
      } = await axios.post<ApiResponse<User>>(LOGIN_URL, {
        email,
        password
      });

      if (requires_2fa) {
        throw new TwoFactorAuthError('Two-factor authentication is required.');
      }

      const auth: AuthModel = {
        access_token: token.personal_access_token,
        api_token: token.personal_access_token,
        refreshToken: undefined
      };

      saveAuth(auth);
      const {
        data: { data: user }
      } = await getUser();
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    try {
      await axios.post(REGISTER_URL, {
        name,
        email,
        password,
        password_confirmation
      });

      const {
        data: { data: token }
      } = await axios.post<ApiResponse<User>>(LOGIN_URL, {
        email,
        password
      });

      const auth: AuthModel = {
        access_token: token.personal_access_token,
        api_token: token.personal_access_token,
        refreshToken: undefined
      };
      saveAuth(auth);
      const {
        data: { data: user }
      } = await getUser();
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };

  const getUser = async () => {
    return await axios.get<ApiResponse<User>>(GET_USER_URL);
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        verify2fa,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
