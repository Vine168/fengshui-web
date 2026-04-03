export interface RolePermissionDefinition {
  key: string;
  name?: string;
  description?: string;
  group?: string;
  module?: string;
  action?: string;
}

export interface AdminRoleRecord {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  permission_keys: string[];
  admin_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RolesListResponse {
  code: number;
  message: string;
  data: {
    roles?: AdminRoleRecord[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface RolePermissionListResponse {
  code: number;
  message: string;
  data: {
    permissions?: RolePermissionDefinition[];
  };
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permission_keys: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permission_keys: string[];
}
