import jwt from 'jsonwebtoken';

type LoginResponse = {
  token?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  error?: string;
};

type MeResponse = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  error?: string;
  code?: string;
};

const BASE_URL = 'https://parselradar-production.up.railway.app';
const LOGIN_URL = `${BASE_URL}/auth/login`;
const ME_URL = `${BASE_URL}/auth/me`;
const JWT_DIAGNOSTICS_URL = `${BASE_URL}/__jwt-diagnostics`;
const AUTH_DEBUG_URL = `${BASE_URL}/__auth-debug`;
const EXPECTED_EMAIL = 'pilot@test.com';

function fail(reason: string, details: Record<string, unknown> = {}): never {
  const payload = {
    overallStatus: 'FAIL',
    step: 'verify:live-login-contract',
    reason,
    details,
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function pass(details: Record<string, unknown>): void {
  const payload = {
    overallStatus: 'PASS',
    step: 'verify:live-login-contract',
    details,
  };
  console.log(JSON.stringify(payload, null, 2));
}

function parseJson(text: string): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function normalizeError(errorText: string | null, token: string | null, backendCode?: string | null): string {
  const text = String(errorText || '').trim();
  const code = String(backendCode || '').trim();

  if (code) return code;

  if (text.includes('Yetkisiz')) return 'MISSING_AUTH_TOKEN';
  if (text.includes('Kullanıcı bulunamadı')) return 'user not found';
  if (text.includes('Geçersiz oturum')) {
    if (!token) return 'invalid token';
    const decoded = jwt.decode(token) as { exp?: number; iat?: number; role?: string; id?: string } | null;
    if (!decoded) return 'invalid token';
    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.exp === 'number' && decoded.exp <= now) return 'EXPIRED_TOKEN';
    return 'TOKEN_VERIFIED_POST_CHECK_FAILED';
  }
  if (text.includes('Geçersiz rol durumu')) return 'TOKEN_VERIFIED_ROLE_HYDRATION_FAILED';
  return text || 'UNKNOWN_BACKEND_REASON';
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) {
    fail('LIVE_VERIFY_PILOT_PASSWORD is required');
  }

  const loginResponse = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ email: EXPECTED_EMAIL, password }),
    redirect: 'manual',
  });

  const loginText = await loginResponse.text();
  const loginJson = parseJson(loginText) as LoginResponse | null;

  if (loginResponse.status !== 200) {
    fail('POST /auth/login did not return 200', {
      status: loginResponse.status,
      body: loginJson || loginText,
    });
  }

  const token = loginJson?.token;
  if (!token || typeof token !== 'string') {
    fail('login response missing token', { body: loginJson || loginText });
  }

  const loginUser = loginJson?.user;
  if (!loginUser) {
    fail('login response missing user object', { body: loginJson || loginText });
  }

  const meResponse = await fetch(ME_URL, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
    redirect: 'manual',
  });

  const meText = await meResponse.text();
  const meJson = parseJson(meText) as MeResponse | null;

  const jwtDiagnosticsResponse = await fetch(`${JWT_DIAGNOSTICS_URL}?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    redirect: 'manual',
  });
  const jwtDiagnosticsText = await jwtDiagnosticsResponse.text();
  const jwtDiagnosticsJson = parseJson(jwtDiagnosticsText);

  const authDebugResponse = await fetch(AUTH_DEBUG_URL, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
    redirect: 'manual',
  });
  const authDebugText = await authDebugResponse.text();
  const authDebugJson = parseJson(authDebugText);

  if (meResponse.status !== 200) {
    const reason = normalizeError(meJson?.error || meText, token, meJson?.code || null);
    fail('/auth/me did not return 200', {
      status: meResponse.status,
      backendReason: reason,
      backendCode: meJson?.code || null,
      body: meJson || meText,
      loginUser,
      jwtDiagnostics: jwtDiagnosticsJson || jwtDiagnosticsText,
      authDebug: authDebugJson || authDebugText,
    });
  }

  const meUser = meJson || {};
  if (String(meUser.role || '').toUpperCase() !== 'ADMIN') {
    fail('/auth/me returned unexpected role', {
      expected: 'ADMIN',
      actual: meUser.role || null,
      body: meJson || meText,
    });
  }

  pass({
    loginStatus: loginResponse.status,
    meStatus: meResponse.status,
    loginUser,
    meUser,
    jwtDiagnostics: jwtDiagnosticsJson,
    authDebug: authDebugJson,
    tokenPreview: `${token.slice(0, 12)}…`,
  });
}

main().catch((error) => {
  fail('unexpected exception during live login contract verification', {
    message: error instanceof Error ? error.message : String(error),
  });
});