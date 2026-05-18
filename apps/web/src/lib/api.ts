const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function previewBody(text: string, maxLen = 220) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}…`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = '/' + String(path).replace(/^\/+/, '');
  const url = API_URL.replace(/\/+$/, '') + cleanPath;

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
