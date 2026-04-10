import {
  createNotification,
  deleteNotificationById,
  getNotificationById,
  getNotifications,
  previewNotificationAudience,
  sendNotificationById,
  type NotificationsListParams,
} from '../api/notifications.api';
import type {
  NotificationCreateInput,
  NotificationElementTarget,
  NotificationItem,
  NotificationPreviewInput,
  NotificationStatus,
  NotificationSubscriptionTarget,
} from '../types/notification';

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  status: NotificationStatus;
  elements: NotificationElementTarget[];
  subscriptions: NotificationSubscriptionTarget[];
  subscriptionPlanIds: string[];
  recipientCount: number | null;
  createdByName: string;
  sentAt: string;
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean);
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
  const rawRecipientCount = record.recipient_count ?? record.recipients_count;
  const normalizedElements = normalizeStringArray(record.elements);
  const normalizedSubscriptions = normalizeStringArray(record.subscriptions);
  const normalizedSubscriptionPlanIds = normalizeStringArray(
    record.subscription_plan_ids,
  );

  return {
    id: String(record.id ?? ''),
    title: String(record.title ?? ''),
    body: String(record.body ?? ''),
    status: normalizeStatus(record.status),
    elements: normalizedElements as NotificationElementTarget[],
    subscriptions: normalizedSubscriptions as NotificationSubscriptionTarget[],
    subscriptionPlanIds: normalizedSubscriptionPlanIds,
    recipientCount:
      rawRecipientCount === null || rawRecipientCount === undefined
        ? null
        : Number(rawRecipientCount),
    createdByName: String(record.created_by_name ?? ''),
    sentAt: String(record.sent_at ?? ''),
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
  const response = await previewNotificationAudience(params);

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
