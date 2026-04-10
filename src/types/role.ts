// Permission as returned from the API
export interface PermissionObject {
  id: string;
  permission: string; // The permission key (e.g., "dashboard.read")
  description: string;
  created_at?: string;
  group?: string;
}

// Permission definition from GET /admin/roles/permissions/list
export interface RolePermissionDefinition {
  id: string;
  permission: string;
  description: string;
  created_at?: string;
}

// Role object as returned from POST /admin/roles or PUT /admin/roles/{id}
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions: PermissionObject[];
}

// Role record from GET /admin/roles list (may have partial data)
export interface AdminRoleRecord {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permission_keys?: string[];
  permissions?: PermissionObject[];
  admin_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RolesListResponse {
  code: number;
  message: string;
  data: {
    roles: AdminRoleRecord[];
    pagination: {
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
    permissions: RolePermissionDefinition[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface CreateRoleResponse {
  code: number;
  message: string;
  data: RoleResponse;
}

export interface UpdateRoleResponse {
  code: number;
  message: string;
  data: RoleResponse;
}

export interface DeleteRoleResponse {
  code: number;
  message: string;
  data: {
    message: string;
  };
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permission_keys: string[];
}

export interface UpdateRoleInput {
  name: string;
  description: string;
  permission_keys: string[];
}
