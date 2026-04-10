export type NotificationStatus = 'draft' | 'sent' | 'failed';

export type NotificationTargetType = 'all' | 'element' | 'subscription';

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

export type NotificationTargetValue =
  | NotificationElementTarget
  | NotificationSubscriptionTarget;

export type NotificationTargetOperator = 'and' | 'or';

export type NotificationAccountStatus = 'active' | 'inactive' | 'suspended';

export interface NotificationTargetFilters {
  element?: NotificationElementTarget[];
  subscription?: NotificationSubscriptionTarget[];
  account_status?: NotificationAccountStatus[];
  is_active?: boolean | boolean[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  status: NotificationStatus;
  target_type: NotificationTargetType;
  target_value?: string | null;
  target_operator?: NotificationTargetOperator;
  target_filters?: NotificationTargetFilters | null;
  recipient_count?: number;
  error_message?: string | null;
  created_by_name?: string;
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
  target_type?: NotificationTargetType;
  target_value?: NotificationTargetValue;
  target_operator?: NotificationTargetOperator;
  target_filters?: NotificationTargetFilters;
}

export interface NotificationPreviewInput {
  target_type?: NotificationTargetType;
  target_value?: NotificationTargetValue;
  target_operator?: NotificationTargetOperator;
  target_filters?: NotificationTargetFilters;
}
