import {
  createRole,
  deleteRole,
  getRoleById,
  getRolePermissions,
  getRoles,
  updateRole,
  type RoleListParams,
} from '../api/roles.api';
import type {
  CreateRoleInput,
  RolePermissionDefinition,
  UpdateRoleInput,
  AdminRoleRecord,
} from '../types/role';

export type RoleRow = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionKeys: string[];
  permissionCount: number;
  adminCount: number;
};

export type PermissionRow = {
  key: string;
  name: string;
  description: string;
  group: string;
};

function normalizeRole(record: AdminRoleRecord): RoleRow {
  // Extract permission keys from either permission_keys array or permissions objects
  const permissionKeys = record.permission_keys || (record.permissions?.map((p) => p.permission) ?? []);

  return {
    id: record.id,
    name: record.name,
    description: record.description || '',
    isSystem: Boolean(record.is_system),
    permissionKeys,
    permissionCount: permissionKeys.length,
    adminCount: record.admin_count || 0,
  };
}

export function normalizePermission(permission: RolePermissionDefinition): PermissionRow {
  // Extract the last part of the permission key as the name if not provided
  const permissionKey = permission.permission || '';
  const nameParts = permissionKey.split('.');
  const defaultName = nameParts.slice(1).join(' ').replace(/_/g, ' ') || permissionKey;

  return {
    key: permissionKey,
    name: permissionKey, // Use the full key as name for consistency
    description: permission.description || '',
    group: nameParts[0] || 'general',
  };
}

export async function listRoles(params: RoleListParams = {}) {
  const response = await getRoles(params);
  const roles = response.data.roles || [];

  return {
    roles: roles.map((role) => normalizeRole(role)),
    pagination: response.data.pagination || {
      page: 1,
      limit: params.limit || 10,
      total: roles.length,
      total_pages: 1,
    },
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
