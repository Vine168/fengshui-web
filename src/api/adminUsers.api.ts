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
  const path = queryString ? `/admin/users/system?${queryString}` : '/admin/users/system';

  return http.get<AdminUsersListResponse>(path);
}

export async function createAdminUser(payload: CreateAdminUserInput) {
  return http.post<{ code: number; message: string; data: { id: string } }>('/admin/users', payload);
}

export async function getAdminUserById(id: string) {
  return http.get<{ code: number; message: string; data: unknown }>(`/admin/users/${id}`);
}

export async function updateAdminUserById(id: string, payload: UpdateAdminUserInput) {
  const requestPayload: Record<string, unknown> = {};

  if (typeof payload.name === 'string') {
    requestPayload.name = payload.name;
  }

  if (typeof payload.email === 'string') {
    requestPayload.email = payload.email;
  }

  if (typeof payload.is_active === 'boolean') {
    requestPayload.is_active = payload.is_active;
  } else if (payload.status) {
    requestPayload.is_active = payload.status === 'active';
  }

  return http.put<{ code: number; message: string; data: unknown }>(`/admin/users/${id}`, requestPayload);
}

export async function resetAdminPasswordById(id: string, payload: ResetAdminPasswordInput) {
  return http.post<{ code: number; message: string; data: unknown }>(`/admin/users/${id}/reset-password`, payload);
}

export async function deleteAdminUserById(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(`/admin/users/${id}`);
}

export async function assignRoleToAdminUser(id: string, payload: AssignRoleInput) {
  return http.patch<{ code: number; message: string; data: unknown }>(`/admin/roles/admin-users/${id}/role`, payload);
}
