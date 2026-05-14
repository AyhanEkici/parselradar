export const API_URL = '/';

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(API_URL + path, {
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
