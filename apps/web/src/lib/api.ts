const LOCAL_API_URL = 'http://localhost:4000';
const PRODUCTION_API_URL = 'https://parselradar-production.up.railway.app';
const TOKEN_KEY = 'parselradar_token';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function looksLikeFrontendHost(value: string) {
  try {
    const url = new URL(value);
    return /vercel\.app$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || '').trim();

  if (configured) {
    const normalized = normalizeBaseUrl(configured);
    if (!looksLikeFrontendHost(normalized)) {
      return normalized;
    }
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (/vercel\.app$/i.test(hostname)) {
      return PRODUCTION_API_URL;
    }
  }

  return LOCAL_API_URL;
}

function previewBody(text: string, maxLen = 220) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}…`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = '/' + String(path).replace(/^\/+/, '');
  const url = getApiBaseUrl() + cleanPath;

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('parselradar_token')
      : null;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
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
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:changed'));
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
  };
}
