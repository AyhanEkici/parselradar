import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User';

dotenv.config();

const BASE_URL = 'https://parselradar-production.up.railway.app';
const LOGIN_URL = `${BASE_URL}/auth/login`;
const ME_URL = `${BASE_URL}/auth/me`;
const PILOT_EMAIL = 'pilot@test.com';

type LoginResponse = {
  token?: string;
};

type Snapshot = {
  passwordChangedAt: string | null;
  updatedAt: string | null;
  passwordHashFingerprint: string | null;
};

type TraceBundle = {
  generatedAt: string;
  overallStatus: 'PASS' | 'FAIL';
  mutationDetected: boolean;
  mutationPhase: 'none' | 'during_login_1' | 'during_auth_me' | 'during_login_2';
  timeline: {
    beforeLogin: Snapshot;
    afterLogin1: Snapshot;
    afterAuthMe: Snapshot;
    afterLogin2: Snapshot;
  };
  comparisons: {
    beforeToAfterLogin1PasswordChangedAtChanged: boolean;
    afterLogin1ToAfterAuthMePasswordChangedAtChanged: boolean;
    afterAuthMeToAfterLogin2PasswordChangedAtChanged: boolean;
    passwordHashFingerprintChanged: boolean;
  };
  requestStatus: {
    login1: number;
    authMe: number;
    login2: number;
  };
  note: string;
};

function requireEnv(key: string): string {
  const value = String(process.env[key] || '').trim();
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function parseJson<T>(raw: string): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function fingerprint(hashValue?: string | null): string | null {
  if (!hashValue) return null;
  return crypto.createHash('sha256').update(String(hashValue)).digest('hex').slice(0, 12);
}

async function readSnapshot(): Promise<Snapshot> {
  const user = await User.findOne({ email: PILOT_EMAIL }).select('+passwordHash passwordChangedAt updatedAt').lean();
  return {
    passwordChangedAt: user?.passwordChangedAt ? new Date(user.passwordChangedAt as any).toISOString() : null,
    updatedAt: user?.updatedAt ? new Date(user.updatedAt as any).toISOString() : null,
    passwordHashFingerprint: fingerprint(String((user as any)?.passwordHash || '')),
  };
}

async function login(password: string): Promise<{ status: number; token: string | null }> {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: PILOT_EMAIL, password }),
    redirect: 'manual',
  });
  const raw = await response.text();
  const body = parseJson<LoginResponse>(raw);
  return { status: response.status, token: body?.token ? String(body.token) : null };
}

async function getMe(token: string): Promise<number> {
  const response = await fetch(ME_URL, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    redirect: 'manual',
  });
  await response.text();
  return response.status;
}

function toMarkdown(bundle: TraceBundle): string {
  const lines: string[] = [];
  lines.push('# Password Mutation Trace');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push(`Mutation detected: ${bundle.mutationDetected}`);
  lines.push(`Mutation phase: ${bundle.mutationPhase}`);
  lines.push('');
  lines.push('## Timeline');
  lines.push(`- beforeLogin.passwordChangedAt: ${bundle.timeline.beforeLogin.passwordChangedAt ?? 'null'}`);
  lines.push(`- afterLogin1.passwordChangedAt: ${bundle.timeline.afterLogin1.passwordChangedAt ?? 'null'}`);
  lines.push(`- afterAuthMe.passwordChangedAt: ${bundle.timeline.afterAuthMe.passwordChangedAt ?? 'null'}`);
  lines.push(`- afterLogin2.passwordChangedAt: ${bundle.timeline.afterLogin2.passwordChangedAt ?? 'null'}`);
  lines.push(`- beforeLogin.updatedAt: ${bundle.timeline.beforeLogin.updatedAt ?? 'null'}`);
  lines.push(`- afterLogin1.updatedAt: ${bundle.timeline.afterLogin1.updatedAt ?? 'null'}`);
  lines.push(`- afterAuthMe.updatedAt: ${bundle.timeline.afterAuthMe.updatedAt ?? 'null'}`);
  lines.push(`- afterLogin2.updatedAt: ${bundle.timeline.afterLogin2.updatedAt ?? 'null'}`);
  lines.push(`- beforeLogin.passwordHashFingerprint: ${bundle.timeline.beforeLogin.passwordHashFingerprint ?? 'null'}`);
  lines.push(`- afterLogin1.passwordHashFingerprint: ${bundle.timeline.afterLogin1.passwordHashFingerprint ?? 'null'}`);
  lines.push(`- afterAuthMe.passwordHashFingerprint: ${bundle.timeline.afterAuthMe.passwordHashFingerprint ?? 'null'}`);
  lines.push(`- afterLogin2.passwordHashFingerprint: ${bundle.timeline.afterLogin2.passwordHashFingerprint ?? 'null'}`);
  lines.push('');
  lines.push('## Comparison');
  lines.push(`- beforeToAfterLogin1PasswordChangedAtChanged: ${bundle.comparisons.beforeToAfterLogin1PasswordChangedAtChanged}`);
  lines.push(`- afterLogin1ToAfterAuthMePasswordChangedAtChanged: ${bundle.comparisons.afterLogin1ToAfterAuthMePasswordChangedAtChanged}`);
  lines.push(`- afterAuthMeToAfterLogin2PasswordChangedAtChanged: ${bundle.comparisons.afterAuthMeToAfterLogin2PasswordChangedAtChanged}`);
  lines.push(`- passwordHashFingerprintChanged: ${bundle.comparisons.passwordHashFingerprintChanged}`);
  lines.push('');
  lines.push('## Request Status');
  lines.push(`- login1: ${bundle.requestStatus.login1}`);
  lines.push(`- authMe: ${bundle.requestStatus.authMe}`);
  lines.push(`- login2: ${bundle.requestStatus.login2}`);
  lines.push('');
  lines.push(`Note: ${bundle.note}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) throw new Error('LIVE_VERIFY_PILOT_PASSWORD is required');
  await mongoose.connect(requireEnv('MONGODB_URI'));

  try {
    const beforeLogin = await readSnapshot();

    const login1 = await login(password);
    if (login1.status !== 200 || !login1.token) throw new Error(`pilot_login_1_failed_status_${login1.status}`);
    const afterLogin1 = await readSnapshot();

    const authMe = await getMe(login1.token);
    const afterAuthMe = await readSnapshot();

    const login2 = await login(password);
    if (login2.status !== 200 || !login2.token) throw new Error(`pilot_login_2_failed_status_${login2.status}`);
    const afterLogin2 = await readSnapshot();

    const beforeToAfterLogin1PasswordChangedAtChanged = beforeLogin.passwordChangedAt !== afterLogin1.passwordChangedAt;
    const afterLogin1ToAfterAuthMePasswordChangedAtChanged = afterLogin1.passwordChangedAt !== afterAuthMe.passwordChangedAt;
    const afterAuthMeToAfterLogin2PasswordChangedAtChanged = afterAuthMe.passwordChangedAt !== afterLogin2.passwordChangedAt;

    const passwordHashFingerprintChanged =
      beforeLogin.passwordHashFingerprint !== afterLogin1.passwordHashFingerprint ||
      afterLogin1.passwordHashFingerprint !== afterAuthMe.passwordHashFingerprint ||
      afterAuthMe.passwordHashFingerprint !== afterLogin2.passwordHashFingerprint;

    let mutationPhase: TraceBundle['mutationPhase'] = 'none';
    if (beforeToAfterLogin1PasswordChangedAtChanged) mutationPhase = 'during_login_1';
    else if (afterLogin1ToAfterAuthMePasswordChangedAtChanged) mutationPhase = 'during_auth_me';
    else if (afterAuthMeToAfterLogin2PasswordChangedAtChanged) mutationPhase = 'during_login_2';

    const mutationDetected =
      beforeToAfterLogin1PasswordChangedAtChanged ||
      afterLogin1ToAfterAuthMePasswordChangedAtChanged ||
      afterAuthMeToAfterLogin2PasswordChangedAtChanged ||
      passwordHashFingerprintChanged;

    const bundle: TraceBundle = {
      generatedAt: new Date().toISOString(),
      overallStatus: mutationDetected ? 'FAIL' : 'PASS',
      mutationDetected,
      mutationPhase,
      timeline: {
        beforeLogin,
        afterLogin1,
        afterAuthMe,
        afterLogin2,
      },
      comparisons: {
        beforeToAfterLogin1PasswordChangedAtChanged,
        afterLogin1ToAfterAuthMePasswordChangedAtChanged,
        afterAuthMeToAfterLogin2PasswordChangedAtChanged,
        passwordHashFingerprintChanged,
      },
      requestStatus: {
        login1: login1.status,
        authMe,
        login2: login2.status,
      },
      note: mutationDetected
        ? `passwordChangedAt/hash mutation detected; primary phase=${mutationPhase}`
        : 'No passwordChangedAt/hash mutation detected across normal login and /auth/me trace.',
    };

    const proofDir = path.join(process.cwd(), 'proof');
    fs.mkdirSync(proofDir, { recursive: true });
    fs.writeFileSync(path.join(proofDir, 'password-mutation-trace.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(proofDir, 'password-mutation-trace.md'), toMarkdown(bundle), 'utf8');

    const out = {
      overallStatus: bundle.overallStatus,
      step: 'trace:password-mutation',
      mutationPhase: bundle.mutationPhase,
      proof: 'proof/password-mutation-trace.json',
    };

    if (bundle.overallStatus === 'FAIL') {
      console.error(JSON.stringify(out, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify(out, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  const payload = {
    overallStatus: 'FAIL',
    step: 'trace:password-mutation',
    error: error instanceof Error ? error.message : String(error),
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
