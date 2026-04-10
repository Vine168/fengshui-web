export type NotificationStatus = 'draft' | 'sent' | 'failed';

export type NotificationElementTarget =
  | 'wood'
  | 'fire'
  | 'earth'
  | 'metal'
  | 'water';

export type NotificationSubscriptionTarget =
  | 'all_paid'
  | 'free'
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'custom';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  status: NotificationStatus;
  elements?: NotificationElementTarget[];
  subscriptions?: NotificationSubscriptionTarget[];
  subscription_plan_ids?: string[];
  recipient_count?: number | null;
  error_message?: string | null;
  created_by_name?: string;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationsListData {
  notifications: NotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface NotificationsListResponse {
  code: number;
  message: string;
  data: NotificationsListData | NotificationItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface NotificationAudiencePreview {
  total_users?: number;
  count?: number;
  label?: string;
}

export interface NotificationAudiencePreviewResponse {
  code: number;
  message: string;
  data: NotificationAudiencePreview;
}

export interface NotificationDetailResponse {
  code: number;
  message: string;
  data: NotificationItem | { notification: NotificationItem };
}

export interface NotificationCreateInput {
  title: string;
  body: string;
  elements?: NotificationElementTarget[];
  subscriptions?: NotificationSubscriptionTarget[];
  subscription_plan_ids?: string[];
}

export interface NotificationPreviewInput {
  elements?: NotificationElementTarget[];
  subscriptions?: NotificationSubscriptionTarget[];
  subscription_plan_ids?: string[];
}
