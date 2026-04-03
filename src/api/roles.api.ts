import { http } from '../lib/http';
import type {
  CreateRoleInput,
  RolePermissionListResponse,
  RolesListResponse,
  UpdateRoleInput,
} from '../types/role';

export type RoleListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getRoles(params: RoleListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);

  const queryString = query.toString();
  const path = queryString ? `/admin/roles?${queryString}` : '/admin/roles';

  return http.get<RolesListResponse>(path);
}

export async function getRoleById(id: string) {
  return http.get<{ code: number; message: string; data: unknown }>(`/admin/roles/${id}`);
}

export async function createRole(payload: CreateRoleInput) {
  return http.post<{ code: number; message: string; data: unknown }>('/admin/roles', payload);
}

export async function updateRole(id: string, payload: UpdateRoleInput) {
  return http.put<{ code: number; message: string; data: unknown }>(`/admin/roles/${id}`, payload);
}

export async function deleteRole(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(`/admin/roles/${id}`);
}

export async function getRolePermissions() {
  return http.get<RolePermissionListResponse>('/admin/roles/permissions/list');
}
