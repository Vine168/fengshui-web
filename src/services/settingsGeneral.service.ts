import {
  changeAdminSettingsPassword,
  getAdminSettingsProfile,
  logoutAdminSettings,
  updateAdminSettingsProfile,
} from '../api/settingsGeneral.api';
import type {
  AdminSettingsProfile,
  ChangeAdminSettingsPasswordInput,
  UpdateAdminSettingsProfileInput,
} from '../types/settings';

export type SettingsProfile = {
  id: string;
  email: string;
  role: string;
  name: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeProfile(profile: AdminSettingsProfile): SettingsProfile {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    isActive: profile.is_active,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function loadSettingsProfile() {
  const response = await getAdminSettingsProfile();
  return normalizeProfile(response.data);
}

export async function saveSettingsProfile(payload: UpdateAdminSettingsProfileInput) {
  const response = await updateAdminSettingsProfile(payload);
  return normalizeProfile(response.data);
}

export async function saveSettingsPassword(payload: ChangeAdminSettingsPasswordInput) {
  return changeAdminSettingsPassword(payload);
}

export async function logoutSettings() {
  return logoutAdminSettings();
}
