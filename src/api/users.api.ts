import { http } from '../lib/http';
import type { CreateUserInput, UpdateUserInput, UpdateUserStatusInput, User, UsersListResponse } from '../types/user';

export type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sex?: string;
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  plan_id?: string;
  date_filter?: 'today' | 'week' | 'month' | 'custom';
  start_date?: string;
  end_date?: string;
  from_date?: string;
  to_date?: string;
};

export async function getUsersMobile(params: UserListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.sex) query.set('sex', params.sex);
  if (typeof params.is_active === 'boolean') query.set('is_active', String(params.is_active));
  if (params.status) query.set('status', params.status);
  if (params.plan_id) query.set('plan_id', params.plan_id);
  if (params.date_filter) query.set('date_filter', params.date_filter);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);
  if (params.from_date) query.set('from_date', params.from_date);
  if (params.to_date) query.set('to_date', params.to_date);

  const queryString = query.toString();
  const path = queryString ? `/admin/app-users?${queryString}` : '/admin/app-users';

  return http.get<UsersListResponse>(path);
}

export async function updateUserStatusMobile(id: string, payload: UpdateUserStatusInput) {
  return http.patch<{ success: boolean }>(`/admin/app-users/${id}/status`, payload);
}

export async function createUser(payload: CreateUserInput) {
  return http.post<{ id: string }>('/admin/users', payload);
}

export async function getUserById(id: string) {
  return http.get<{ code: number; message: string; data: User }>(`/admin/app-users/${id}`);
}

export async function updateUserById(id: string, payload: UpdateUserInput) {
  return http.put<{ code: number; message: string; data: User }>(`/admin/app-users/${id}`, payload);
}

export async function deleteUserById(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(`/admin/app-users/${id}`);
}
