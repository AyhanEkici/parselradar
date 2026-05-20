export const AUTH_TOKEN_KEY = 'parselradar_token';

export type DeterministicAuthBootstrapResult = {
  hasToken: boolean;
  tokenPreview: string;
};

export function deterministicAuthBootstrap(): DeterministicAuthBootstrapResult {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const hasToken = Boolean(token && token.trim().length > 0);

  // Non-sensitive diagnostics: only expose short token fingerprint segment.
  const tokenPreview = hasToken ? String(token).slice(0, 8) : 'none';

  if (!hasToken && typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return { hasToken, tokenPreview };
}

export function cleanupInvalidAuthState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
