const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw data || { error: 'API request failed' };
  }

  return data;
}