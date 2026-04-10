import { http } from '../lib/http';

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: 'admin' | 'editor' | string;
  role_id: string | null;
  name?: string;
  is_active?: boolean;
  created_at?: string;
};

export type LoginData = {
  admin: AuthUser;
  access_token: string;
  expires_in: number;
  permissions: string[];
  must_change_password: boolean;
};

export type LoginResponse = {
  success?: boolean;
  data: LoginData;
};

export type MeAdmin = {
  id: string;
  email: string;
  role: string;
  role_id: string | null;
  name: string;
  first_name: string | null;
  last_name: string | null;
  notification_prefs: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_role: {
    id: string;
    name: string;
    description?: string | null;
    is_system?: boolean;
    permission_keys?: string[];
  } | null;
};

export type MeResponse = {
  code: number;
  message: string;
  data: {
    admin: MeAdmin;
    permissions: string[];
  };
};

export async function login(payload: LoginInput) {
  return http.post<LoginResponse>('/admin/auth/login', payload);
}

export async function logout() {
  return http.post<{ success: boolean }>('/admin/auth/logout');
}

export async function me() {
  return http.get<MeResponse>('/admin/auth/me');
}
