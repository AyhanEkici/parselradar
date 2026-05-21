import { apiFetch } from './api';
import { clearAuthSession, StoredUser } from './authStorage';

type AuthSuccessResponse = { token: string; user: StoredUser };
type AuthErrorResponse = { error: string };
type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export async function getMe(): Promise<StoredUser> {
  return apiFetch('/auth/me') as Promise<StoredUser>;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return (await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })) as AuthResponse;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return (await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })) as AuthResponse;
}

export async function logout(): Promise<void> {
  clearAuthSession();
  // Dispatch for cross-tab sync — this is the ONLY place auth:changed fires on logout.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore server-side logout errors; local session is already cleared.
  }
}

export async function forgotPassword(email: string) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}