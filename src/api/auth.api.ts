import { http } from '../lib/http';

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | string;
  is_active: boolean;
  created_at: string;
};

export type LoginData = {
  admin: AuthUser;
  access_token: string;
  expires_in: string;
  must_change_password: boolean;
};

export type LoginResponse = {
  data: LoginData;
};

export async function login(payload: LoginInput) {
  return http.post<LoginResponse>('/admin/auth/login', payload);
}

export async function logout() {
  return http.post<{ success: boolean }>('/admin/auth/logout');
}
