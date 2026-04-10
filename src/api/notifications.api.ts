import { http } from '../lib/http';
import type {
  NotificationAudiencePreviewResponse,
  NotificationCreateInput,
  NotificationDetailResponse,
  NotificationElementTarget,
  NotificationPreviewInput,
  NotificationSubscriptionTarget,
  NotificationsListResponse,
  NotificationStatus,
} from '../types/notification';

export type NotificationsListParams = {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
};

function appendCsvParam<T extends string>(
  query: URLSearchParams,
  key: string,
  values?: T[],
) {
  if (!values || values.length === 0) return;
  query.set(key, values.join(','));
}

export async function getNotifications(params: NotificationsListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(Math.min(params.limit, 100)));
  if (params.status) query.set('status', params.status);

  const queryString = query.toString();
  const path = queryString
    ? `/admin/notifications?${queryString}`
    : '/admin/notifications';

  return http.get<NotificationsListResponse>(path);
}

export async function previewNotificationAudience(
  params: NotificationPreviewInput = {},
) {
  const query = new URLSearchParams();
  appendCsvParam<NotificationElementTarget>(query, 'elements', params.elements);
  appendCsvParam<NotificationSubscriptionTarget>(
    query,
    'subscriptions',
    params.subscriptions,
  );
  appendCsvParam<string>(
    query,
    'subscription_plan_ids',
    params.subscription_plan_ids,
  );

  const queryString = query.toString();
  const path = queryString
    ? `/admin/notifications/preview-audience?${queryString}`
    : '/admin/notifications/preview-audience';

  return http.get<NotificationAudiencePreviewResponse>(path);
}

export async function createNotification(payload: NotificationCreateInput) {
  return http.post<NotificationDetailResponse>('/admin/notifications', payload);
}

export async function getNotificationById(id: string) {
  return http.get<NotificationDetailResponse>(`/admin/notifications/${id}`);
}

export async function sendNotificationById(id: string) {
  return http.post<NotificationDetailResponse>(
    `/admin/notifications/${id}/send`,
    {},
  );
}

export async function deleteNotificationById(id: string) {
  return http.delete<{ code: number; message: string; data?: unknown }>(
    `/admin/notifications/${id}`,
  );
}
