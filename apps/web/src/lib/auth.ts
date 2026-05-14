import { apiFetch } from './api';

export async function getMe() {
  return apiFetch('auth/me');
}

export async function login(email: string, password: string) {
  return apiFetch('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function register(email: string, password: string, name: string) {
  return apiFetch('auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}

export async function logout() {
  return apiFetch('auth/logout', { method: 'POST' });
}
