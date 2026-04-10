export type PromoCodeDiscountType = 'percentage' | 'amount';

export type PromoCodeStatus = 'active' | 'expired' | 'disabled';

export interface PromoCode {
  id: string;
  code: string;
  discount_value: number;
  total_usage_limit: number;
  used_count: number;
  discount_type: PromoCodeDiscountType;
  expires_at: string;
  max_uses_per_user: number;
  status: PromoCodeStatus;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeListFilters {
  search: string | null;
  status: PromoCodeStatus | null;
  discount_type: PromoCodeDiscountType | null;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface PromoCodesListResponse {
  code: number;
  message: string;
  data: {
    promo_codes: PromoCode[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    filters: PromoCodeListFilters;
  };
}

export interface PromoCodeInput {
  code: string;
  discount_value: number;
  total_usage_limit: number;
  discount_type: PromoCodeDiscountType;
  expires_at: string;
  max_uses_per_user: number;
  status?: PromoCodeStatus;
}

export interface UpdatePromoCodeInput extends Partial<PromoCodeInput> {}