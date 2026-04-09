import {
  createNotification,
  deleteNotificationById,
  getNotificationById,
  getNotifications,
  previewNotificationAudienceLegacy,
  previewNotificationAudience,
  sendNotificationById,
  type NotificationAudienceLegacyParams,
  type NotificationsListParams,
} from '../api/notifications.api';
import type {
  NotificationCreateInput,
  NotificationItem,
  NotificationPreviewInput,
  NotificationStatus,
  NotificationTargetType,
} from '../types/notification';

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  status: NotificationStatus;
  targetType: NotificationTargetType;
  targetValue: string;
  recipientCount: number;
  createdAt: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeStatus(value: unknown): NotificationStatus {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'sent') return 'sent';
  if (normalized === 'failed') return 'failed';
  return 'draft';
}

function normalizeTargetType(value: unknown): NotificationTargetType {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'element') return 'element';
  if (normalized === 'subscription') return 'subscription';
  return 'all';
}

function unwrapNotificationData(value: unknown) {
  const data = asRecord(value);
  if ('notification' in data) {
    return asRecord(data.notification);
  }
  return data;
}

export function normalizeNotification(value: unknown): NotificationRow {
  const record = asRecord(value);

  return {
    id: String(record.id ?? ''),
    title: String(record.title ?? ''),
    body: String(record.body ?? ''),
    status: normalizeStatus(record.status),
    targetType: normalizeTargetType(record.target_type),
    targetValue: String(record.target_value ?? ''),
    recipientCount: Number(
      record.recipient_count ?? record.recipients_count ?? 0,
    ),
    createdAt: String(record.created_at ?? record.updated_at ?? ''),
  };
}

export async function listNotifications(params: NotificationsListParams = {}) {
  const response = await getNotifications(params);
  const root = asRecord(response);
  const rawData = root.data;
  const data = asRecord(rawData);
  const notificationsSource = Array.isArray(rawData)
    ? rawData
    : Array.isArray(data.notifications)
      ? data.notifications
      : [];
  const pagination = asRecord(data.pagination);
  const rootPagination = asRecord(root.pagination);

  return {
    notifications: notificationsSource.map((item) =>
      normalizeNotification(item as NotificationItem),
    ),
    pagination: {
      total: Number(
        pagination.total ?? rootPagination.total ?? notificationsSource.length ?? 0,
      ),
      page: Number(pagination.page ?? rootPagination.page ?? params.page ?? 1),
      limit: Number(
        pagination.limit ?? rootPagination.limit ?? params.limit ?? 20,
      ),
      total_pages: Number(
        pagination.total_pages ?? rootPagination.total_pages ?? 1,
      ),
    },
  };
}

export async function previewAudience(params: NotificationPreviewInput) {
  const useLegacy =
    typeof params.target_type === 'string' &&
    !params.target_operator &&
    !params.target_filters;

  const response = useLegacy
    ? await previewNotificationAudienceLegacy(
        params as NotificationAudienceLegacyParams,
      )
    : await previewNotificationAudience(params);

  const root = asRecord(response);
  const data = asRecord(root.data);
  return {
    count: Number(data.total_users ?? data.count ?? 0),
    label:
      typeof data.label === 'string' && data.label.trim()
        ? data.label
        : null,
  };
}

export async function createNotificationDraft(payload: NotificationCreateInput) {
  const response = await createNotification(payload);
  return normalizeNotification(unwrapNotificationData(asRecord(response).data));
}

export async function getNotification(id: string) {
  const response = await getNotificationById(id);
  return normalizeNotification(unwrapNotificationData(asRecord(response).data));
}

export async function sendNotification(id: string) {
  const response = await sendNotificationById(id);
  return normalizeNotification(unwrapNotificationData(asRecord(response).data));
}

export async function deleteNotification(id: string) {
  return deleteNotificationById(id);
}
