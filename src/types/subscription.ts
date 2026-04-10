export interface SubscriptionPlanFeatureObject {
  type?: string;
  description?: string;
}

export type SubscriptionPlanFeature = string | SubscriptionPlanFeatureObject | null;

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price: number;
  duration: number;
  feature: SubscriptionPlanFeature;
  is_active: boolean;
  active_users: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlansListFilters {
  search: string | null;
  is_active: boolean | null;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface SubscriptionPlansListResponse {
  code: number;
  message: string;
  data: {
    subscription_plans: SubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    filters: SubscriptionPlansListFilters;
  };
}

export interface SubscriptionPlanInput {
  plan_name: string;
  plan_type: string;
  price: number;
  duration: number;
  feature?: SubscriptionPlanFeature;
  is_active?: boolean;
}

export interface UpdateSubscriptionPlanInput extends Partial<SubscriptionPlanInput> {}
