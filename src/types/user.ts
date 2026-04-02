export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  sex?: string;
  element?: string;
  missing?: string;
  plan_type?: string;
  plan_name?: string;
  plan_id?: string;
  current_subscription?: {
    id: string;
    plan_id: string;
    plan_name: string;
    plan_type: string;
    status: string;
    started_at: string;
    expires_at: string;
    payment_id: string | null;
  } | null;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserStatusInput {
  status: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  sex?: string;
  status?: 'active' | 'inactive' | 'suspended';
  plan_id?: string;
  date_of_birth?: string | null;
  time_of_birth?: string | null;
}

export interface AvailablePlan {
  id: string;
  name?: string;
  plan_name?: string;
  plan_type?: string;
}

export interface UsersListFilters {
  available_plans: AvailablePlan[];
}

export interface UsersListResponse {
  code: number;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    filters: UsersListFilters;
  };
}

export interface CreateUserInput {
  name: string;
  email?: string;
  password: string;
  element?: string;
  missing?: string;
  plan_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
}
