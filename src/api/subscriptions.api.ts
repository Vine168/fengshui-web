import { http } from '../lib/http';
import type {
  SubscriptionPlan,
  SubscriptionPlanInput,
  SubscriptionPlansListResponse,
  UpdateSubscriptionPlanInput,
} from '../types/subscription';

export type SubscriptionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export async function getSubscriptions(params: SubscriptionListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (typeof params.is_active === 'boolean') query.set('is_active', String(params.is_active));
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const queryString = query.toString();
  const path = queryString ? `/admin/subscriptions?${queryString}` : '/admin/subscriptions';

  return http.get<SubscriptionPlansListResponse>(path);
}

export async function getSubscriptionById(id: string) {
  return http.get<{ code: number; message: string; data: SubscriptionPlan }>(`/admin/subscriptions/${id}`);
}

export async function createSubscription(payload: SubscriptionPlanInput) {
  return http.post<{ code: number; message: string; data: SubscriptionPlan }>('/admin/subscriptions', payload);
}

export async function updateSubscription(id: string, payload: UpdateSubscriptionPlanInput) {
  return http.put<{ code: number; message: string; data: SubscriptionPlan }>(`/admin/subscriptions/${id}`, payload);
}

export async function deleteSubscription(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(`/admin/subscriptions/${id}`);
}
