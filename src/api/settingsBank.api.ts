import { http } from '../lib/http';
import type {
  AdminBankConfigResponse,
  AdminSettingsActionResponse,
  UpdateAdminBankConfigInput,
} from '../types/settings';

export async function getAdminBankConfig() {
  return http.get<AdminBankConfigResponse>('/admin/bank-config');
}

export async function updateAdminBankConfig(payload: UpdateAdminBankConfigInput) {
  return http.put<AdminBankConfigResponse>('/admin/bank-config', payload);
}

export async function testAdminBankConfig() {
  return http.post<AdminSettingsActionResponse>('/admin/bank-config/test');
}
