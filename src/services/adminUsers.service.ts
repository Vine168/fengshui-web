import {
  assignRoleToAdminUser,
  assignRoleToAdminUserFromRolesModule,
  createAdminUser,
  deleteAdminUserById,
  getAdminUserById,
  getAdminUsers,
  resetAdminPasswordById,
  updateAdminUserById,
  type AdminUsersListParams,
} from '../api/adminUsers.api';
import type { AssignRoleInput, CreateAdminUserInput, ResetAdminPasswordInput, UpdateAdminUserInput, AdminUserRecord } from '../types/admin';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  lastActive: string;
  rolePermissionKeys: string[];
};

function normalizeAdminUser(
  record: AdminUserRecord,
  roleNameById: Map<string, string>,
): AdminUserRow {
  const roleValue = record.role;
  const role =
    roleValue && typeof roleValue === 'object'
      ? (roleValue as { id?: string; name?: string; is_system?: boolean; permission_keys?: string[] })
      : null;
  const roleFromString = typeof roleValue === 'string' ? roleValue : '';
  const status =
    typeof record.is_active === 'boolean'
      ? record.is_active
        ? 'active'
        : 'inactive'
      : record.status === 'active'
        ? 'active'
        : 'inactive';

  const roleId = record.role_id || record.roleId || role?.id || '';
  const resolvedRoleName =
    roleFromString ||
    record.role_name ||
    record.roleName ||
    role?.name ||
    (roleId ? roleNameById.get(roleId) : undefined) ||
    (roleId ? 'Assigned Role' : 'Unassigned');

  return {
    id: record.id,
    name: record.name || 'Unnamed Admin',
    email: record.email || '-',
    status,
    roleId,
    roleName: resolvedRoleName,
    isSystemRole: Boolean(
      record.is_system || role?.is_system || resolvedRoleName === 'admin',
    ),
    lastActive: record.last_active_at || record.updated_at || record.created_at || 'Never',
    rolePermissionKeys: role?.permission_keys || [],
  };
}

export async function listAdminUsers(params: AdminUsersListParams = {}) {
  const response = await getAdminUsers(params);
  const payload = response.data;
  const rows = payload.admins || payload.users || [];

  const roles = payload.filters?.roles || [];
  const roleNameById = new Map(roles.map((role) => [role.id, role.name]));

  let admins = rows.map((record) => normalizeAdminUser(record, roleNameById));

  if (params.role_id) {
    admins = admins.filter((admin) => admin.roleId === params.role_id);
  }

  return {
    admins,
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

export async function changeAdminStatus(id: string, status: AdminUserRow['status']) {
  return updateAdminUserById(id, { is_active: status === 'active' });
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

export async function setAdminRoleFromRolesModule(
  id: string,
  payload: AssignRoleInput,
) {
  return assignRoleToAdminUserFromRolesModule(id, payload);
}
