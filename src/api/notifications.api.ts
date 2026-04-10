import { http } from '../lib/http';
import type {
  NotificationAudiencePreviewResponse,
  NotificationCreateInput,
  NotificationDetailResponse,
  NotificationPreviewInput,
  NotificationsListResponse,
  NotificationStatus,
  NotificationTargetType,
} from '../types/notification';

export type NotificationsListParams = {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
  target_type?: NotificationTargetType;
};

export type NotificationAudienceLegacyParams = {
  target_type: NotificationTargetType;
  target_value?: string;
};

export async function getNotifications(params: NotificationsListParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(Math.min(params.limit, 100)));
  if (params.status) query.set('status', params.status);
  if (params.target_type) query.set('target_type', params.target_type);

  const queryString = query.toString();
  const path = queryString
    ? `/admin/notifications?${queryString}`
    : '/admin/notifications';

  return http.get<NotificationsListResponse>(path);
}

export async function previewNotificationAudienceLegacy(
  params: NotificationAudienceLegacyParams,
) {
  const query = new URLSearchParams();
  query.set('target_type', params.target_type);

  if (params.target_value) {
    query.set('target_value', params.target_value);
  }

  return http.get<NotificationAudiencePreviewResponse>(
    `/admin/notifications/preview-audience?${query.toString()}`,
  );
}

export async function previewNotificationAudience(
  payload: NotificationPreviewInput,
) {
  return http.post<NotificationAudiencePreviewResponse>(
    '/admin/notifications/preview-audience',
    payload,
  );
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
