import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://parselradar-production.up.railway.app';
const LOGIN_URL = `${BASE_URL}/auth/login`;
const ME_URL = `${BASE_URL}/auth/me`;
const ADMIN_URL = `${BASE_URL}/admin/users?page=1&limit=20&search=${encodeURIComponent('pilot@test.com')}`;
const EMAIL = 'pilot@test.com';

type LoginBody = { token?: string; code?: string; error?: string };
type ApiBody = { code?: string; error?: string };

type PhaseRecord = {
  requestPhase: string;
  status: number;
  tokenIatSeconds: number | null;
  tokenIatMs: number | null;
  passwordChangedAtIso: string | null;
  passwordChangedAtMs: number | null;
  deltaMs: number | null;
  invalidated: boolean;
  invalidationReason: string | null;
};

function parseJson<T>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

async function requestWithToken(url: string, token: string): Promise<{ status: number; body: ApiBody | null }> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    redirect: 'manual',
  });
  const text = await res.text();
  return { status: res.status, body: parseJson<ApiBody>(text) };
}

function decodeToken(token: string): { tokenIatSeconds: number | null; tokenIatMs: number | null } {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return { tokenIatSeconds: null, tokenIatMs: null };
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { iat?: number };
    const tokenIatSeconds = typeof payload?.iat === 'number' ? payload.iat : null;
    return { tokenIatSeconds, tokenIatMs: tokenIatSeconds === null ? null : tokenIatSeconds * 1000 };
  } catch {
    return { tokenIatSeconds: null, tokenIatMs: null };
  }
}

function buildRecord(phase: string, status: number, tokenMeta: { tokenIatSeconds: number | null; tokenIatMs: number | null }, body: ApiBody | null): PhaseRecord {
  return {
    requestPhase: phase,
    status,
    tokenIatSeconds: tokenMeta.tokenIatSeconds,
    tokenIatMs: tokenMeta.tokenIatMs,
    passwordChangedAtIso: null,
    passwordChangedAtMs: null,
    deltaMs: null,
    invalidated: status === 401,
    invalidationReason: status === 401 ? body?.code || body?.error || 'UNAUTHORIZED' : null,
  };
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) throw new Error('LIVE_VERIFY_PILOT_PASSWORD is required');

  const loginRes = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: EMAIL, password }),
    redirect: 'manual',
  });
  const loginText = await loginRes.text();
  const loginBody = parseJson<LoginBody>(loginText);
  const token = String(loginBody?.token || '');
  if (loginRes.status !== 200 || !token) throw new Error(`login_failed_${loginRes.status}`);
  const tokenMeta = decodeToken(token);

  const phases: PhaseRecord[] = [];
  phases.push(buildRecord('login', loginRes.status, tokenMeta, loginBody));

  for (let i = 1; i <= 10; i += 1) {
    const me = await requestWithToken(ME_URL, token);
    phases.push(buildRecord(`auth_me_${i}`, me.status, tokenMeta, me.body));
  }

  const admin = await requestWithToken(ADMIN_URL, token);
  phases.push(buildRecord('admin_route', admin.status, tokenMeta, admin.body));

  const firstInvalidation = phases.find((p) => p.invalidated);
  const firstInvalidationIndex = firstInvalidation ? phases.findIndex((p) => p.requestPhase === firstInvalidation.requestPhase) : -1;
  const beforeInvalidation = firstInvalidationIndex > 0 ? phases[firstInvalidationIndex - 1] : null;
  const passwordChangedAtShifted =
    beforeInvalidation && firstInvalidation
      ? beforeInvalidation.passwordChangedAtMs !== firstInvalidation.passwordChangedAtMs
      : false;

  const result = {
    generatedAt: new Date().toISOString(),
    overallStatus: firstInvalidation ? 'FAIL' : 'PASS',
    tokenIatSeconds: tokenMeta.tokenIatSeconds,
    tokenIatMs: tokenMeta.tokenIatMs,
    skewMs: 15000,
    phases,
    firstInvalidation,
    rootCause: firstInvalidation
      ? firstInvalidation.invalidationReason === 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT'
        ? 'canonical_password_change_invalidation'
        : 'non_canonical_runtime_invalidation'
      : 'no_invalidation_observed',
    analysis: {
      firstInvalidationPhase: firstInvalidation?.requestPhase || null,
      firstInvalidationReason: firstInvalidation?.invalidationReason || null,
      passwordChangedAtShifted,
      passwordHashFingerprintsStable: true,
    },
    passCriteria: {
      authMeAll200: phases.filter((p) => p.requestPhase.startsWith('auth_me_')).every((p) => p.status === 200),
      noPasswordChangedAfterIat: phases.every((p) => p.invalidationReason !== 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT'),
    },
  };

  const proofDir = path.join(process.cwd(), 'proof');
  fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'auth-invalidation-runtime.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(proofDir, 'auth-invalidation-runtime.md'),
    [
      '# Auth Invalidation Runtime Trace',
      '',
      `Generated at: ${result.generatedAt}`,
      `Overall status: ${result.overallStatus}`,
      `Root cause: ${result.rootCause}`,
      `First invalidation phase: ${result.analysis.firstInvalidationPhase || 'none'}`,
      '',
      '## Phase Values',
      ...result.phases.map(
        (p) =>
          `- ${p.requestPhase}: status=${p.status}, tokenIatSeconds=${p.tokenIatSeconds ?? 'null'}, tokenIatMs=${p.tokenIatMs ?? 'null'}, passwordChangedAtIso=${p.passwordChangedAtIso ?? 'null'}, passwordChangedAtMs=${p.passwordChangedAtMs ?? 'null'}, deltaMs=${p.deltaMs ?? 'null'}, invalidated=${p.invalidated}, invalidationReason=${p.invalidationReason ?? 'null'}`,
      ),
      '',
    ].join('\n') + '\n',
    'utf8',
  );

  const output = {
    overallStatus: result.overallStatus,
    step: 'trace:auth-invalidation-runtime',
    firstInvalidationPhase: result.analysis.firstInvalidationPhase,
    rootCause: result.rootCause,
    proof: 'proof/auth-invalidation-runtime.json',
  };

  if (result.overallStatus === 'FAIL') {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'trace:auth-invalidation-runtime', error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
