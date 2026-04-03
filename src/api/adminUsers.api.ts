import { http } from '../lib/http';
import type {
  AdminUsersListResponse,
  AssignRoleInput,
  CreateAdminUserInput,
  ResetAdminPasswordInput,
  UpdateAdminStatusInput,
  UpdateAdminUserInput,
} from '../types/admin';

export type AdminUsersListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role_id?: string;
};

export async function getAdminUsers(params: AdminUsersListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.role_id) query.set('role_id', params.role_id);

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
  return http.put<{ code: number; message: string; data: unknown }>(`/admin/users/${id}`, payload);
}

export async function updateAdminStatusById(id: string, payload: UpdateAdminStatusInput) {
  return http.patch<{ code: number; message: string; data: unknown }>(`/admin/users/${id}/status`, payload);
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
