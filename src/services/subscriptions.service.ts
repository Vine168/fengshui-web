import type { SubscriptionPlanInput, UpdateSubscriptionPlanInput } from '../types/subscription';
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptions,
  updateSubscription,
  type SubscriptionListParams,
} from '../api/subscriptions.api';

export async function listSubscriptions(params: SubscriptionListParams = {}) {
  const response = await getSubscriptions(params);
  return {
    plans: response.data.subscription_plans,
    pagination: response.data.pagination,
    filters: response.data.filters,
  };
}

export async function getSubscription(id: string) {
  const response = await getSubscriptionById(id);
  return response.data;
}

export async function addSubscription(payload: SubscriptionPlanInput) {
  const response = await createSubscription(payload);
  return response.data;
}

export async function editSubscription(id: string, payload: UpdateSubscriptionPlanInput) {
  const response = await updateSubscription(id, payload);
  return response.data;
}

export async function removeSubscription(id: string) {
  return deleteSubscription(id);
}
