import { http } from '../lib/http';
import type {
  AdminUsersListResponse,
  AssignRoleInput,
  CreateAdminUserInput,
  ResetAdminPasswordInput,
  UpdateAdminUserInput,
} from '../types/admin';

export type AdminUsersListParams = {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  role_id?: string;
};

export async function getAdminUsers(params: AdminUsersListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (typeof params.is_active === 'boolean') {
    query.set('is_active', String(params.is_active));
  }

  const queryString = query.toString();
  const path = queryString
    ? `/admin/system-users?${queryString}`
    : '/admin/system-users';

  return http.get<AdminUsersListResponse>(path);
}

export async function createAdminUser(payload: CreateAdminUserInput) {
  const requestPayload: Record<string, unknown> = {
    role: 'editor',
    email: payload.email,
    password: payload.password,
  };

  if (typeof payload.name === 'string' && payload.name.trim()) {
    requestPayload.name = payload.name.trim();
  }

  return http.post<{ code: number; message: string; data: { id: string } }>(
    '/admin/system-users',
    requestPayload,
  );
}

export async function getAdminUserById(id: string) {
  return http.get<{ code: number; message: string; data: unknown }>(
    `/admin/system-users/${id}`,
  );
}

export async function updateAdminUserById(id: string, payload: UpdateAdminUserInput) {
  const requestPayload: Record<string, unknown> = {};

  if (typeof payload.name === 'string') {
    requestPayload.name = payload.name;
  }

  if (typeof payload.is_active === 'boolean') {
    requestPayload.is_active = payload.is_active;
  } else if (payload.status) {
    requestPayload.is_active = payload.status === 'active';
  }

  return http.put<{ code: number; message: string; data: unknown }>(
    `/admin/system-users/${id}`,
    requestPayload,
  );
}

export async function resetAdminPasswordById(id: string, payload: ResetAdminPasswordInput) {
  const requestPayload = payload?.password?.trim()
    ? { password: payload.password.trim() }
    : undefined;

  return http.post<{ code: number; message: string; data: unknown }>(
    `/admin/system-users/${id}/reset-password`,
    requestPayload,
  );
}

export async function deleteAdminUserById(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(
    `/admin/system-users/${id}`,
  );
}

export async function assignRoleToAdminUser(id: string, payload: AssignRoleInput) {
  const requestPayload: Record<string, unknown> = {};

  if (typeof payload.role === 'string' && payload.role.trim()) {
    requestPayload.role = payload.role.trim();
  }

  if (typeof payload.role_id === 'string' && payload.role_id.trim()) {
    requestPayload.role_id = payload.role_id.trim();
  }

  return http.patch<{ code: number; message: string; data: unknown }>(
    `/admin/system-users/${id}/role`,
    requestPayload,
  );
}

export async function assignRoleToAdminUserFromRolesModule(id: string, payload: AssignRoleInput) {
  const requestPayload: Record<string, unknown> = {};

  if (typeof payload.role === 'string' && payload.role.trim()) {
    requestPayload.role = payload.role.trim();
  }

  if (typeof payload.role_id === 'string' && payload.role_id.trim()) {
    requestPayload.role_id = payload.role_id.trim();
  }

  return http.patch<{ code: number; message: string; data: unknown }>(
    `/admin/roles/admin-users/${id}/role`,
    requestPayload,
  );
}
