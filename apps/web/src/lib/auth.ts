
import { apiFetch } from './api';

export async function getMe() {
  return apiFetch('auth/me');
}

export async function login(email: string, password: string) {
  const res = await apiFetch('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (res.token) localStorage.setItem('parselradar_token', res.token);
  return res;
}

export async function register(email: string, password: string, name: string) {
  const res = await apiFetch('auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
  if (res.token) localStorage.setItem('parselradar_token', res.token);
  return res;
}

export async function logout() {
  localStorage.removeItem('parselradar_token');
  return apiFetch('auth/logout', { method: 'POST' });
}
