import { http } from '../lib/http';
import type {
  AdminTelegramConfigResponse,
  AdminTelegramFeaturesResponse,
  AdminTelegramTestResponse,
  UpdateAdminTelegramConfigInput,
  UpdateAdminTelegramFeaturesInput,
} from '../types/telegram';

export async function getTelegramConfig() {
  return http.get<AdminTelegramConfigResponse>('/admin/telegram/config');
}

export async function updateTelegramConfig(payload: UpdateAdminTelegramConfigInput) {
  return http.put<AdminTelegramConfigResponse>('/admin/telegram/config', payload);
}

export async function getTelegramFeatures() {
  return http.get<AdminTelegramFeaturesResponse>('/admin/telegram/features');
}

export async function updateTelegramFeatures(payload: UpdateAdminTelegramFeaturesInput) {
  return http.put<AdminTelegramFeaturesResponse>('/admin/telegram/features', payload);
}

export async function testTelegramNotification() {
  return http.post<AdminTelegramTestResponse>('/admin/telegram/test', {});
}