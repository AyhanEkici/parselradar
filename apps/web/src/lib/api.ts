
export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = '/' + String(path).replace(/^\/+/, '');
  const url = API_URL + cleanPath;
  const token = typeof window !== 'undefined' ? localStorage.getItem('parselradar_token') : undefined;
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    if (!res.ok) throw await res.json();
    return res.json();
  });
}
