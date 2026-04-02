import { login, logout, type LoginInput } from '../api/auth.api';

export async function signIn(payload: LoginInput) {
  const response = await login(payload);
  localStorage.setItem('admin_token', response.data.access_token);
  localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
  localStorage.setItem('isLoggedIn', 'true');
  return response.data.admin;
}

export async function signOut() {
  try {
    await logout();
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }
}

export function getStoredUser() {
  const rawUser = localStorage.getItem('admin_user') || localStorage.getItem('user');
  return rawUser ? JSON.parse(rawUser) : null;
}
