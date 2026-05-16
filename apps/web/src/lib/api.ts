export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = '/' + String(path).replace(/^\/+/, '');
  const url = API_URL + cleanPath;
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    if (!res.ok) throw await res.json();
    return res.json();
  });
}
