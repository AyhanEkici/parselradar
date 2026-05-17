import { apiFetch } from './api';

type AuthResponse = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  token?: string;
  error?: string;
};

const TOKEN_KEY = 'parselradar_token';

function persistToken(response: AuthResponse) {
  if (response?.token && typeof response.token === 'string') {
    localStorage.setItem(TOKEN_KEY, response.token);
  }
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export async function login(email: string, password: string) {
  const response = (await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })) as AuthResponse;

  persistToken(response);

  return response;
}

export async function register(email: string, password: string, name: string) {
  const response = (await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      name,
    }),
  })) as AuthResponse;

  persistToken(response);

  return response;
}

export async function logout() {
  localStorage.removeItem(TOKEN_KEY);

  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}