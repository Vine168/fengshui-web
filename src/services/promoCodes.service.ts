import type { PromoCodeInput, UpdatePromoCodeInput } from '../types/promoCode';
import {
  createPromoCode,
  deletePromoCode,
  getPromoCodeById,
  getPromoCodes,
  updatePromoCode,
  type PromoCodeListParams,
} from '../api/promoCodes.api';

export interface PromoCodeRow {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'expired' | 'disabled';
  expiryDate: string;
  usageCount: number;
  usageLimit: number;
  maxUsesPerUser: number;
}

export function normalizePromoCode(plan: { [key: string]: unknown }) {
  return {
    id: String(plan.id),
    code: String(plan.code),
    type: String(plan.discount_type) === 'amount' ? 'fixed' : 'percentage',
    value: Number(plan.discount_value ?? 0),
    status: String(plan.status) as 'active' | 'expired' | 'disabled',
    expiryDate: String(plan.expires_at ?? ''),
    usageCount: Number(plan.used_count ?? 0),
    usageLimit: Number(plan.total_usage_limit ?? 0),
    maxUsesPerUser: Number(plan.max_uses_per_user ?? 1),
  } satisfies PromoCodeRow;
}

export async function listPromoCodes(params: PromoCodeListParams = {}) {
  const response = await getPromoCodes(params);
  return {
    codes: response.data.promo_codes.map((plan) => normalizePromoCode(plan)),
    pagination: response.data.pagination,
    filters: response.data.filters,
  };
}

export async function getPromoCode(id: string) {
  const response = await getPromoCodeById(id);
  return normalizePromoCode(response.data);
}

export async function addPromoCode(payload: PromoCodeInput) {
  const response = await createPromoCode(payload);
  return normalizePromoCode(response.data);
}

export async function editPromoCodeById(id: string, payload: UpdatePromoCodeInput) {
  const response = await updatePromoCode(id, payload);
  return normalizePromoCode(response.data);
}

export async function removePromoCodeById(id: string) {
  return deletePromoCode(id);
}