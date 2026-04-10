import {
  getTelegramConfig,
  getTelegramFeatures,
  testTelegramNotification,
  updateTelegramConfig,
  updateTelegramFeatures,
} from '../api/telegram.api';
import type {
  AdminTelegramConfig,
  AdminTelegramFeatures,
  TelegramNotifyOn,
  UpdateAdminTelegramConfigInput,
  UpdateAdminTelegramFeaturesInput,
} from '../types/telegram';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeNotifyOn(value: unknown): TelegramNotifyOn {
  const record = asRecord(value);
  return {
    payment_paid: Boolean(record.payment_paid),
    payment_failed: Boolean(record.payment_failed),
    payment_verify_failed: Boolean(record.payment_verify_failed),
    login_alert: Boolean(record.login_alert),
  };
}

export function normalizeTelegramConfig(value: unknown): AdminTelegramConfig {
  const record = asRecord(value);

  return {
    id: String(record.id ?? ''),
    bot_token: String(record.bot_token ?? ''),
    chat_ids: Array.isArray(record.chat_ids)
      ? record.chat_ids.map((item) => String(item ?? '').trim()).filter(Boolean)
      : [],
    is_enabled: Boolean(record.is_enabled),
    notify_on: normalizeNotifyOn(record.notify_on),
    source: String(record.source ?? ''),
    updated_by:
      record.updated_by === null || record.updated_by === undefined
        ? null
        : String(record.updated_by),
    updated_at: String(record.updated_at ?? ''),
  };
}

export function normalizeTelegramFeatures(value: unknown): AdminTelegramFeatures {
  const record = asRecord(value);

  return {
    mobile_otp: Boolean(record.mobile_otp),
    payment_checkout: Boolean(record.payment_checkout),
    admin_broadcast_notifications: Boolean(record.admin_broadcast_notifications),
    telegram_alerts: Boolean(record.telegram_alerts),
  };
}

export async function loadTelegramConfig() {
  const response = await getTelegramConfig();
  return normalizeTelegramConfig(response.data);
}

export async function saveTelegramConfig(payload: UpdateAdminTelegramConfigInput) {
  const response = await updateTelegramConfig(payload);
  return normalizeTelegramConfig(response.data);
}

export async function loadTelegramFeatures() {
  const response = await getTelegramFeatures();
  return normalizeTelegramFeatures(response.data);
}

export async function saveTelegramFeatures(payload: UpdateAdminTelegramFeaturesInput) {
  const response = await updateTelegramFeatures(payload);
  return normalizeTelegramFeatures(response.data);
}

export async function sendTelegramTestMessage() {
  return testTelegramNotification();
}