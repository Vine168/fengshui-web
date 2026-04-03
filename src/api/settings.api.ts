import { http } from '../lib/http';
import type {
  AdminSettingsActionResponse,
  AdminSettingsProfileResponse,
  ChangeAdminSettingsPasswordInput,
  UpdateAdminSettingsProfileInput,
} from '../types/settings';

export async function getAdminSettingsProfile() {
  return http.get<AdminSettingsProfileResponse>('/admin/settings/profile');
}

export async function updateAdminSettingsProfile(payload: UpdateAdminSettingsProfileInput) {
  return http.patch<AdminSettingsProfileResponse>('/admin/settings/profile', payload);
}

export async function changeAdminSettingsPassword(payload: ChangeAdminSettingsPasswordInput) {
  return http.post<AdminSettingsActionResponse>('/admin/settings/change-password', payload);
}

export async function logoutAdminSettings() {
  return http.post<AdminSettingsActionResponse>('/admin/settings/logout');
}