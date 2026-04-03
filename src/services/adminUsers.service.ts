import {
  assignRoleToAdminUser,
  createAdminUser,
  deleteAdminUserById,
  getAdminUserById,
  getAdminUsers,
  resetAdminPasswordById,
  updateAdminStatusById,
  updateAdminUserById,
  type AdminUsersListParams,
} from '../api/adminUsers.api';
import type { AssignRoleInput, CreateAdminUserInput, ResetAdminPasswordInput, UpdateAdminStatusInput, UpdateAdminUserInput, AdminUserRecord } from '../types/admin';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  lastActive: string;
  rolePermissionKeys: string[];
};

function normalizeAdminUser(record: AdminUserRecord): AdminUserRow {
  const role = record.role;
  const status = record.status || 'inactive';

  return {
    id: record.id,
    name: record.name || 'Unnamed Admin',
    email: record.email || '-',
    status,
    roleId: record.role_id || role?.id || '',
    roleName: record.role_name || role?.name || 'Unassigned',
    isSystemRole: Boolean(record.is_system || role?.is_system),
    lastActive: record.last_active_at || record.updated_at || record.created_at || 'Never',
    rolePermissionKeys: role?.permission_keys || [],
  };
}

export async function listAdminUsers(params: AdminUsersListParams = {}) {
  const response = await getAdminUsers(params);
  const payload = response.data;
  const rows = payload.admins || payload.users || [];

  const roles = payload.filters?.roles || [];

  return {
    admins: rows.map((record) => normalizeAdminUser(record)),
    pagination: payload.pagination || { page: 1, limit: params.limit || 10, total: rows.length, total_pages: 1 },
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      isSystem: Boolean(role.is_system),
      permissionKeys: role.permission_keys || [],
    })),
  };
}

export async function addAdminUser(payload: CreateAdminUserInput) {
  return createAdminUser(payload);
}

export async function getAdminUser(id: string) {
  const response = await getAdminUserById(id);
  return response.data;
}

export async function editAdminUser(id: string, payload: UpdateAdminUserInput) {
  const response = await updateAdminUserById(id, payload);
  return response.data;
}

export async function changeAdminStatus(id: string, status: UpdateAdminStatusInput['status']) {
  return updateAdminStatusById(id, { status });
}

export async function resetAdminPassword(id: string, payload: ResetAdminPasswordInput) {
  return resetAdminPasswordById(id, payload);
}

export async function removeAdminUser(id: string) {
  return deleteAdminUserById(id);
}

export async function setAdminRole(id: string, payload: AssignRoleInput) {
  return assignRoleToAdminUser(id, payload);
}
