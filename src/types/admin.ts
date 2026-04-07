export type AdminStatus = 'active' | 'inactive' | 'suspended';

export interface AdminPermissionDefinition {
  key: string;
  name?: string;
  description?: string;
  group?: string;
  module?: string;
  action?: string;
}

export interface AdminRoleSummary {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  permission_keys?: string[];
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  status?: AdminStatus;
  is_active?: boolean;
  account_type?: string;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
  role_id?: string;
  role_name?: string;
  role?: AdminRoleSummary | string | null;
  roleId?: string;
  roleName?: string;
  is_system?: boolean;
}

export interface AdminUsersListResponse {
  code: number;
  message: string;
  data: {
    admins?: AdminUserRecord[];
    users?: AdminUserRecord[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    filters?: {
      roles?: AdminRoleSummary[];
      statuses?: AdminStatus[];
    };
  };
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role_id?: string;
  status?: AdminStatus;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  status?: AdminStatus;
  is_active?: boolean;
}

export interface UpdateAdminStatusInput {
  status: AdminStatus;
}

export interface ResetAdminPasswordInput {
  password: string;
}

export interface AssignRoleInput {
  role_id?: string;
  role?: string;
}
