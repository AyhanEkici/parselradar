// authStorage.ts — single source of truth for auth token & user storage.
// All reads/writes to localStorage for auth MUST go through these helpers.
// No other file should reference 'parselradar_token' or 'parselradar_user' directly.

export const AUTH_TOKEN_KEY = 'parselradar_token';
export const AUTH_USER_KEY = 'parselradar_user';
export const AUTH_LOGIN_WRITE_KEY = 'parselradar_login_write_in_progress';
const AUTH_LOGIN_WRITE_MAX_AGE_MS = 15000;

export type StoredUser = { id: string; email: string; name: string; role: string };

function hasWindow() {
  return typeof window !== 'undefined';
}

function readStorageValue(key: string): string | null {
  if (!hasWindow()) return null;
  const localValue = localStorage.getItem(key);
  return localValue && localValue.trim().length > 0 ? localValue : null;
}

/** Returns the stored JWT or null if absent/empty. */
export function getAuthToken(): string | null {
  if (!hasWindow()) return null;
  const t = readStorageValue(AUTH_TOKEN_KEY);
  return t && t.trim().length > 0 ? t : null;
}

/** Returns the stored user object or null. */
export function getStoredUser(): StoredUser | null {
  if (!hasWindow()) return null;
  try {
    const raw = readStorageValue(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function markLoginWriteInProgress(active = true): void {
  if (!hasWindow()) return;
  if (active) {
    localStorage.setItem(AUTH_LOGIN_WRITE_KEY, String(Date.now()));
    return;
  }
  localStorage.removeItem(AUTH_LOGIN_WRITE_KEY);
}

export function isLoginWriteInProgress(): boolean {
  if (!hasWindow()) return false;
  const value = localStorage.getItem(AUTH_LOGIN_WRITE_KEY);
  if (!value) return false;

  const startedAt = Number(value);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    localStorage.removeItem(AUTH_LOGIN_WRITE_KEY);
    return false;
  }

  const ageMs = Date.now() - startedAt;
  if (ageMs > AUTH_LOGIN_WRITE_MAX_AGE_MS) {
    localStorage.removeItem(AUTH_LOGIN_WRITE_KEY);
    return false;
  }

  return true;
}

/**
 * Persist a new session and notify same-tab + cross-tab listeners.
 * Call this after a successful login or register response.
 */
export function setAuthSession(token: string, user: StoredUser): void {
  if (!hasWindow()) return;
  markLoginWriteInProgress(true);
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  const writeOk = Boolean(getAuthToken() && getStoredUser());
  markLoginWriteInProgress(false);

  if (!writeOk) {
    clearAuthSession('login_write_verification_failed');
    throw new Error('AUTH_SESSION_WRITE_FAILED');
  }

  // Notify listeners (useAuth cross-tab sync, other components)
  window.dispatchEvent(new Event('auth:changed'));
}

/**
 * Remove auth data from storage WITHOUT dispatching auth:changed.
 * Used internally (e.g. 401 handling) where we don't want to trigger
 * a re-hydration loop. Callers that need cross-tab notification (logout)
 * must dispatch 'auth:changed' themselves.
 */
export function clearAuthSession(reason = 'unspecified'): void {
  if (!hasWindow()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_LOGIN_WRITE_KEY);
  localStorage.setItem('parselradar_last_clear_reason', reason);
}

/** True only when BOTH token + user exist in localStorage. */
export function hasAuthSession(): boolean {
  if (!hasWindow()) return false;
  return Boolean(getAuthToken() && getStoredUser());
}

/**
 * Repairs split-brain auth storage (token without user or user without token).
 * Returns true when storage is internally consistent after reconciliation.
 */
export function assertStorageConsistency(): boolean {
  if (!hasWindow()) return true;
  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const localUserRaw = localStorage.getItem(AUTH_USER_KEY);

  if (isLoginWriteInProgress()) {
    return false;
  }

  const token = getAuthToken();
  const user = getStoredUser();

  if (!token && !user) return true;
  if (token && user) return true;

  // Never destructively clear a valid token when storage events are racing
  // across tabs (token write and user write are separate events).
  // Keep token-only state and let hydrateAuth reconcile via /auth/me.
  if (token && !user) {
    return false;
  }

  // user-without-token is stale and unsafe; clear only user side.
  if (!token && user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return false;
  }

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
