import { login, logout, me, type LoginInput } from '../api/auth.api';
import { logoutSettings } from './settingsGeneral.service';

const ACCESS_UPDATED_EVENT = 'admin-access-updated';

function notifyAccessUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ACCESS_UPDATED_EVENT));
  }
}

export function storeAdminAccess(admin: unknown, permissions: string[]) {
  localStorage.setItem('admin_user', JSON.stringify(admin));
  localStorage.setItem('admin_permissions', JSON.stringify(permissions || []));
  notifyAccessUpdated();
}

export async function signIn(payload: LoginInput) {
  const response = await login(payload);
  localStorage.setItem('admin_token', response.data.access_token);
  storeAdminAccess(response.data.admin, response.data.permissions || []);
  localStorage.setItem('isLoggedIn', 'true');
  return response.data.admin;
}

export async function refreshAdminAccessContext() {
  const response = await me();
  storeAdminAccess(response.data.admin, response.data.permissions || []);
  return response.data;
}

export async function signOut() {
  try {
    await logoutSettings();
  } catch {
    try {
      await logout();
    } catch {
      // Ignore logout errors and clear local state below.
    }
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_permissions');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    notifyAccessUpdated();
  }
}

export function getStoredUser() {
  const rawUser = localStorage.getItem('admin_user') || localStorage.getItem('user');
  return rawUser ? JSON.parse(rawUser) : null;
}

export function getStoredPermissions() {
  const raw = localStorage.getItem('admin_permissions');
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    return [] as string[];
  } catch {
    return [] as string[];
  }
}
