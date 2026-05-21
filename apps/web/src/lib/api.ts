import { getAuthToken, isAuthHydrating } from './authStorage';
import { retryableFetch } from './RetryableFetch';
import { validateFrontendEnv } from './envValidator';

export function getApiBaseUrl() {
  return validateFrontendEnv().apiUrl;
}

function previewBody(text: string, maxLen = 220) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}…`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = '/' + String(path).replace(/^\/+/, '');
  const url = getApiBaseUrl() + cleanPath;

  const token = getAuthToken();

  const method = String(options.method || 'GET').toUpperCase();
  const baseHeaders = {
    ...(typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;
  let retryAttempts = 0;
  try {
    if (method === 'GET') {
      const outcome = await retryableFetch(
        url,
        {
          ...options,
          method,
          credentials: 'include',
          headers: {
            ...baseHeaders,
            'X-Client-Retry-Attempts': '0',
          },
        },
        { maxRetries: 2, timeoutMs: 12000, initialBackoffMs: 250 }
      );
      response = outcome.response;
      retryAttempts = outcome.retryAttempts;
    } else {
      const outcome = await retryableFetch(
        url,
        {
          ...options,
          method,
          credentials: 'include',
          headers: {
            ...baseHeaders,
            'X-Client-Retry-Attempts': '0',
          },
        },
        { maxRetries: 0, timeoutMs: 12000, initialBackoffMs: 250 }
      );
      response = outcome.response;
      retryAttempts = outcome.retryAttempts;
    }
  } catch (err) {
    throw {
      error: 'API request failed before response',
      status: 0,
      url,
      retryAttempts: (err as { retryAttempts?: number })?.retryAttempts || 0,
      reason: (err as { reason?: string })?.reason || 'NETWORK_OR_TIMEOUT',
    };
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (retryAttempts > 0 && method === 'GET') {
    // Retry attempts are mirrored into throw payloads and successful non-JSON returns.
  }
  const text = await response.text();

  const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json');
  const isHtml = contentType.includes('text/html') || text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().startsWith('<html');

  let data: any = null;
  if (isJson) {
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
  }

  if (isHtml) {
    const err = {
      error: 'API route returned HTML instead of JSON. Check route mount or API base URL.',
      status: response.status,
      url,
      contentType: response.headers.get('content-type') || null,
      preview: previewBody(text),
    };
    throw err;
  }

  if (!response.ok) {
    if (response.status === 401 && !isAuthHydrating()) {
      // 401s are surfaced to callers; session clearing is handled explicitly
      // by logout() or confirmed auth invalidation logic in useAuth.
    }
    if (data) {
      throw { ...data, status: response.status, url };
    }
    throw {
      error: 'API request failed',
      status: response.status,
      url,
      contentType: response.headers.get('content-type') || null,
      preview: previewBody(text),
      retryAttempts,
    };
  }

  if (isJson) return data;

  // Non-JSON success responses are unexpected for apiFetch; return a diagnostic.
  return {
    ok: true,
    status: response.status,
    url,
    contentType: response.headers.get('content-type') || null,
    preview: previewBody(text),
    retryAttempts,
  };
}
