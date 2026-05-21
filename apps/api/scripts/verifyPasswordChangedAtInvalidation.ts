import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BASE_URL = 'https://parselradar-production.up.railway.app';
const LOGIN_URL = `${BASE_URL}/auth/login`;
const ME_URL = `${BASE_URL}/auth/me`;
const EXPECTED_EMAIL = 'pilot@test.com';

function parseJson(text: string): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function login(password: string): Promise<string> {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: EXPECTED_EMAIL, password }),
    redirect: 'manual',
  });
  const body = parseJson(await response.text());
  if (response.status !== 200 || !body?.token) throw new Error(`login_failed_${response.status}`);
  return String(body.token);
}

async function authMe(token: string): Promise<{ status: number; code: string | null }> {
  const response = await fetch(ME_URL, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    redirect: 'manual',
  });
  const body = parseJson(await response.text());
  return { status: response.status, code: body?.code || null };
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) throw new Error('LIVE_VERIFY_PILOT_PASSWORD is required');

  const token = await login(password);
  const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')) as { iat?: number };
  const tokenIatSeconds = typeof decoded?.iat === 'number' ? decoded.iat : null;
  const tokenIatMs = tokenIatSeconds === null ? null : tokenIatSeconds * 1000;
  const meStatuses: number[] = [];
  const meCodes: string[] = [];

  for (let i = 0; i < 10; i += 1) {
    const me = await authMe(token);
    meStatuses.push(me.status);
    meCodes.push(me.code || '');
  }

  const all200 = meStatuses.every((status) => status === 200);
  const noInvalidation = meCodes.every((code) => code !== 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT');

  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: all200 && noInvalidation ? 'PASS' : 'FAIL',
    proofs: {
      loginProof: { status: tokenIatMs !== null ? 'PASS' : 'FAIL', detail: `tokenIatMs=${tokenIatMs ?? 'null'}` },
      authMe200Proof: { status: all200 ? 'PASS' : 'FAIL', detail: `statuses=${meStatuses.join(',')}` },
      noPasswordResetProof: {
        status: noInvalidation ? 'PASS' : 'FAIL',
        detail: `authMeCodes=${meCodes.join(',') || 'none'}`,
      },
      noCredentialChangeProof: { status: 'PASS', detail: 'No credential mutation performed in verifier.' },
    },
    trace: {
      iatSeconds: tokenIatSeconds,
      tokenIssuedAtMs: tokenIatMs,
      passwordChangedAtIso: null,
      passwordChangedAtMs: null,
      deltaMs: null,
      skewMs: 15000,
      wouldInvalidateCurrentToken: !noInvalidation,
      oldTokenSimulation: {
        simulatedOldTokenIssuedAtMs: tokenIatMs ? tokenIatMs - 15001 : null,
        wouldInvalidate: false,
        rule: 'No server-side passwordChangedAt evidence observed in live HTTP-only verifier.',
      },
    },
    diagnostics: {
      meStatuses,
      meCodes,
      tokenIatSeconds,
      tokenIatMs,
      all200,
      noInvalidation,
    },
  };

  fs.writeFileSync(path.join(ROOT, 'proof', 'password-invalidation-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(ROOT, 'proof', 'password-invalidation-proof-bundle.md'),
    [
      '# Password Invalidation Proof Bundle',
      '',
      `Overall status: ${bundle.overallStatus}`,
      `meStatuses: ${meStatuses.join(', ')}`,
      `tokenIatMs: ${bundle.trace.tokenIssuedAtMs ?? 'null'}`,
      `passwordChangedAtMs: ${bundle.trace.passwordChangedAtMs ?? 'null'}`,
      `deltaMs: ${bundle.trace.deltaMs ?? 'null'}`,
      '',
    ].join('\n') + '\n',
    'utf8',
  );

  if (bundle.overallStatus !== 'PASS') {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:password-invalidation', repeatedAuthMeStatuses: meStatuses, proof: 'proof/password-invalidation-proof-bundle.json' }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:password-invalidation', repeatedAuthMeStatuses: meStatuses, proof: 'proof/password-invalidation-proof-bundle.json' }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:password-invalidation', error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
