import {
  createRole,
  deleteRole,
  getRoleById,
  getRolePermissions,
  getRoles,
  updateRole,
  type RoleListParams,
} from '../api/roles.api';
import type { CreateRoleInput, RolePermissionDefinition, UpdateRoleInput, AdminRoleRecord } from '../types/role';

export type RoleRow = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionKeys: string[];
  permissionCount: number;
  adminCount: number;
};

function normalizeRole(record: AdminRoleRecord): RoleRow {
  return {
    id: record.id,
    name: record.name,
    description: record.description || '',
    isSystem: Boolean(record.is_system),
    permissionKeys: record.permission_keys || [],
    permissionCount: record.permission_keys?.length || 0,
    adminCount: record.admin_count || 0,
  };
}

export function normalizePermission(permission: RolePermissionDefinition) {
  const permissionKey = (permission as RolePermissionDefinition & { permission?: string }).permission || permission.key;

  return {
    key: permissionKey,
    name: permission.name || permissionKey.split('.').slice(1).join(' ').replace(/_/g, ' ') || permissionKey,
    description: permission.description || '',
    group: permission.group || permission.module || permissionKey.split('.')[0] || 'general',
  };
}

export async function listRoles(params: RoleListParams = {}) {
  const response = await getRoles(params);
  const roles = response.data.roles || [];

  return {
    roles: roles.map((role) => normalizeRole(role)),
    pagination: response.data.pagination || { page: 1, limit: params.limit || 10, total: roles.length, total_pages: 1 },
  };
}

export async function listRolePermissions() {
  const response = await getRolePermissions();
  return (response.data.permissions || []).map((permission) => normalizePermission(permission));
}

export async function getRole(id: string) {
  const response = await getRoleById(id);
  return response.data;
}

export async function addRole(payload: CreateRoleInput) {
  return createRole(payload);
}

export async function editRole(id: string, payload: UpdateRoleInput) {
  return updateRole(id, payload);
}

export async function removeRole(id: string) {
  return deleteRole(id);
}
