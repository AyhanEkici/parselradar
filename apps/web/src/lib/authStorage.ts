// authStorage.ts — single source of truth for auth token & user storage.
// All reads/writes to localStorage for auth MUST go through these helpers.
// No other file should reference 'parselradar_token' or 'parselradar_user' directly.

export const AUTH_TOKEN_KEY = 'parselradar_token';
export const AUTH_USER_KEY = 'parselradar_user';

export type StoredUser = { id: string; email: string; name: string; role: string };

/** Returns the stored JWT or null if absent/empty. */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const t = localStorage.getItem(AUTH_TOKEN_KEY);
  return t && t.trim().length > 0 ? t : null;
}

/** Returns the stored user object or null. */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Persist a new session and notify same-tab + cross-tab listeners.
 * Call this after a successful login or register response.
 */
export function setAuthSession(token: string, user: StoredUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  // Notify listeners (useAuth cross-tab sync, other components)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }
}

/**
 * Remove auth data from storage WITHOUT dispatching auth:changed.
 * Used internally (e.g. 401 handling) where we don't want to trigger
 * a re-hydration loop. Callers that need cross-tab notification (logout)
 * must dispatch 'auth:changed' themselves.
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

/** True only when BOTH token + user exist in localStorage. */
export function hasAuthSession(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(getAuthToken() && getStoredUser());
}

/**
 * Repairs split-brain auth storage (token without user or user without token).
 * Returns true when storage is internally consistent after reconciliation.
 */
export function assertStorageConsistency(): boolean {
  if (typeof window === 'undefined') return true;
  const token = getAuthToken();
  const user = getStoredUser();

  if (!token && !user) return true;
  if (token && user) return true;

  clearAuthSession();
  return false;
}

/** Returns the Authorization header value or null if no token. */
export function getAuthHeader(): string | null {
  const token = getAuthToken();
  return token ? `Bearer ${token}` : null;
}

// ---------------------------------------------------------------------------
// Hydration guard — prevents apiFetch from wiping a valid token when
// a transient 401 occurs during the initial /auth/me call on page load.
// Set to true by useAuth before calling getMe(), false in the finally block.
// ---------------------------------------------------------------------------
let _authHydrating = false;

/** Mark the auth hydration phase as active/inactive. */
export function setAuthHydrating(value: boolean): void {
  _authHydrating = value;
}

/** Returns true while useAuth is in its initial /auth/me hydration pass. */
export function isAuthHydrating(): boolean {
  return _authHydrating;
}
