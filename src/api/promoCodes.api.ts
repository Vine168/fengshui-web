import { http } from '../lib/http';
import type { PromoCode, PromoCodeInput, PromoCodesListResponse, UpdatePromoCodeInput } from '../types/promoCode';

export type PromoCodeListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'expired' | 'disabled';
  discount_type?: 'percentage' | 'amount';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export async function getPromoCodes(params: PromoCodeListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.discount_type) query.set('discount_type', params.discount_type);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const queryString = query.toString();
  const path = queryString ? `/admin/promo-codes?${queryString}` : '/admin/promo-codes';

  return http.get<PromoCodesListResponse>(path);
}

export async function getPromoCodeById(id: string) {
  return http.get<{ code: number; message: string; data: PromoCode }>(`/admin/promo-codes/${id}`);
}

export async function createPromoCode(payload: PromoCodeInput) {
  return http.post<{ code: number; message: string; data: PromoCode }>('/admin/promo-codes', payload);
}

export async function updatePromoCode(id: string, payload: UpdatePromoCodeInput) {
  return http.put<{ code: number; message: string; data: PromoCode }>(`/admin/promo-codes/${id}`, payload);
}

export async function deletePromoCode(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(`/admin/promo-codes/${id}`);
}