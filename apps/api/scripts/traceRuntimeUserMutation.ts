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
const ADMIN_USERS_URL = `${BASE_URL}/admin/users?page=1&limit=200&search=${encodeURIComponent('pilot@test.com')}`;
const PILOT_EMAIL = 'pilot@test.com';

type LoginResponse = { token?: string; user?: { id?: string } };

type AdminUsersResponse = { users?: Array<Record<string, unknown>> };

type Snapshot = {
  passwordChangedAt: string | null;
  updatedAt: string | null;
  passwordHashFingerprint: string | null;
};

type RuntimeTraceBundle = {
  generatedAt: string;
  overallStatus: 'PASS' | 'FAIL';
  mutationDetected: boolean;
  mutationPhase:
    | 'none'
    | 'during_login'
    | 'during_auth_me_first'
    | 'during_auth_me_second'
    | 'during_admin_route'
    | 'multiple_phases'
    | 'blocked_hash_fingerprint_unavailable';
  timeline: {
    beforeLogin: Snapshot;
    afterLogin: Snapshot;
    afterAuthMe1: Snapshot;
    afterAuthMe2: Snapshot;
    afterAdminRoute: Snapshot;
  };
  requestStatus: {
    bootstrapLogin: number;
    trackedLogin: number;
    authMe1: number;
    authMe2: number;
    adminRoute: number;
  };
  deltas: {
    passwordChangedAtChanged: { login: boolean; authMe1: boolean; authMe2: boolean; adminRoute: boolean };
    updatedAtChanged: { login: boolean; authMe1: boolean; authMe2: boolean; adminRoute: boolean };
    passwordHashFingerprintChanged: { login: boolean | null; authMe1: boolean | null; authMe2: boolean | null; adminRoute: boolean | null };
  };
  likelySourcePath: string;
  hashFingerprintAvailable: boolean;
};

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

async function getWithToken(url: string, token: string): Promise<number> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    redirect: 'manual',
  });
  await response.text();
  return response.status;
}

async function readPasswordFieldsFromDb(): Promise<{ passwordHashFingerprint: string | null; available: boolean }> {
  const uri = String(process.env.MONGODB_URI || '').trim();
  if (!uri) return { passwordHashFingerprint: null, available: false };
  await mongoose.connect(uri);
  try {
    const user = await User.findOne({ email: { $regex: '^pilot@test.com$', $options: 'i' } }).select('+passwordHash').lean();
    if (!user) return { passwordHashFingerprint: null, available: false };
    return { passwordHashFingerprint: fingerprint(String((user as any).passwordHash || '')), available: true };
  } finally {
    await mongoose.disconnect();
  }
}

async function readAdminSnapshot(token: string): Promise<{ status: number; passwordChangedAt: string | null; updatedAt: string | null }> {
  const response = await fetch(ADMIN_USERS_URL, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    redirect: 'manual',
  });
  const raw = await response.text();
  const body = parseJson<AdminUsersResponse>(raw);
  const user = (body?.users || []).find((u) => String((u as { email?: string }).email || '').toLowerCase() === PILOT_EMAIL);
  return {
    status: response.status,
    passwordChangedAt: user?.passwordChangedAt ? new Date(String(user.passwordChangedAt)).toISOString() : null,
    updatedAt: user?.updatedAt ? new Date(String(user.updatedAt)).toISOString() : null,
  };
}

function pickPhase(d: RuntimeTraceBundle['deltas']): { phase: RuntimeTraceBundle['mutationPhase']; source: string } {
  const phases: Array<{ key: RuntimeTraceBundle['mutationPhase']; hit: boolean; source: string }> = [
    { key: 'during_login', hit: d.passwordChangedAtChanged.login === true, source: 'apps/api/src/controllers/authController.ts -> login' },
    { key: 'during_auth_me_first', hit: d.passwordChangedAtChanged.authMe1 === true, source: 'apps/api/src/middleware/auth.ts or authController.getMe' },
    { key: 'during_auth_me_second', hit: d.passwordChangedAtChanged.authMe2 === true, source: 'apps/api/src/middleware/auth.ts or authController.getMe' },
    { key: 'during_admin_route', hit: d.passwordChangedAtChanged.adminRoute === true, source: 'apps/api/src/middleware/auth.ts or /admin handlers' },
  ];
  const active = phases.filter((p) => p.hit);
  if (active.length === 0) return { phase: 'none', source: 'no_runtime_user_mutation_observed' };
  if (active.length > 1) return { phase: 'multiple_phases', source: active.map((p) => p.source).join(' | ') };
  return { phase: active[0].key, source: active[0].source };
}

function toMarkdown(bundle: RuntimeTraceBundle): string {
  return [
    '# Runtime User Mutation Trace',
    '',
    `Generated at: ${bundle.generatedAt}`,
    `Overall status: ${bundle.overallStatus}`,
    `Mutation detected: ${bundle.mutationDetected}`,
    `Mutation phase: ${bundle.mutationPhase}`,
    `Likely source path: ${bundle.likelySourcePath}`,
    `hashFingerprintAvailable: ${bundle.hashFingerprintAvailable}`,
    '',
    '## Timeline',
    `- beforeLogin.passwordChangedAt: ${bundle.timeline.beforeLogin.passwordChangedAt ?? 'null'}`,
    `- afterLogin.passwordChangedAt: ${bundle.timeline.afterLogin.passwordChangedAt ?? 'null'}`,
    `- afterAuthMe1.passwordChangedAt: ${bundle.timeline.afterAuthMe1.passwordChangedAt ?? 'null'}`,
    `- afterAuthMe2.passwordChangedAt: ${bundle.timeline.afterAuthMe2.passwordChangedAt ?? 'null'}`,
    `- afterAdminRoute.passwordChangedAt: ${bundle.timeline.afterAdminRoute.passwordChangedAt ?? 'null'}`,
    '',
  ].join('\n');
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) throw new Error('LIVE_VERIFY_PILOT_PASSWORD is required');

  const bootstrap = await login(password);
  if (bootstrap.status !== 200 || !bootstrap.token) throw new Error(`bootstrap_login_failed_${bootstrap.status}`);

  const dbBefore = await readPasswordFieldsFromDb();
  const beforeAdmin = await readAdminSnapshot(bootstrap.token);
  const beforeLogin: Snapshot = {
    passwordChangedAt: beforeAdmin.passwordChangedAt,
    updatedAt: beforeAdmin.updatedAt,
    passwordHashFingerprint: dbBefore.passwordHashFingerprint,
  };

  const tracked = await login(password);
  if (tracked.status !== 200 || !tracked.token) throw new Error(`tracked_login_failed_${tracked.status}`);

  const dbAfterLogin = await readPasswordFieldsFromDb();
  const afterLoginAdmin = await readAdminSnapshot(bootstrap.token);
  const afterLogin: Snapshot = {
    passwordChangedAt: afterLoginAdmin.passwordChangedAt,
    updatedAt: afterLoginAdmin.updatedAt,
    passwordHashFingerprint: dbAfterLogin.passwordHashFingerprint,
  };

  const authMe1 = await getWithToken(ME_URL, tracked.token);
  const dbAfterMe1 = await readPasswordFieldsFromDb();
  const afterMe1Admin = await readAdminSnapshot(bootstrap.token);
  const afterAuthMe1: Snapshot = {
    passwordChangedAt: afterMe1Admin.passwordChangedAt,
    updatedAt: afterMe1Admin.updatedAt,
    passwordHashFingerprint: dbAfterMe1.passwordHashFingerprint,
  };

  const authMe2 = await getWithToken(ME_URL, tracked.token);
  const dbAfterMe2 = await readPasswordFieldsFromDb();
  const afterMe2Admin = await readAdminSnapshot(bootstrap.token);
  const afterAuthMe2: Snapshot = {
    passwordChangedAt: afterMe2Admin.passwordChangedAt,
    updatedAt: afterMe2Admin.updatedAt,
    passwordHashFingerprint: dbAfterMe2.passwordHashFingerprint,
  };

  const adminRoute = await getWithToken(ADMIN_USERS_URL, tracked.token);
  const dbAfterAdmin = await readPasswordFieldsFromDb();
  const afterAdminAdmin = await readAdminSnapshot(bootstrap.token);
  const afterAdminRoute: Snapshot = {
    passwordChangedAt: afterAdminAdmin.passwordChangedAt,
    updatedAt: afterAdminAdmin.updatedAt,
    passwordHashFingerprint: dbAfterAdmin.passwordHashFingerprint,
  };

  const hashAvailable = dbBefore.available && dbAfterLogin.available && dbAfterMe1.available && dbAfterMe2.available && dbAfterAdmin.available;

  const deltas: RuntimeTraceBundle['deltas'] = {
    passwordChangedAtChanged: {
      login: beforeLogin.passwordChangedAt !== afterLogin.passwordChangedAt,
      authMe1: afterLogin.passwordChangedAt !== afterAuthMe1.passwordChangedAt,
      authMe2: afterAuthMe1.passwordChangedAt !== afterAuthMe2.passwordChangedAt,
      adminRoute: afterAuthMe2.passwordChangedAt !== afterAdminRoute.passwordChangedAt,
    },
    updatedAtChanged: {
      login: beforeLogin.updatedAt !== afterLogin.updatedAt,
      authMe1: afterLogin.updatedAt !== afterAuthMe1.updatedAt,
      authMe2: afterAuthMe1.updatedAt !== afterAuthMe2.updatedAt,
      adminRoute: afterAuthMe2.updatedAt !== afterAdminRoute.updatedAt,
    },
    passwordHashFingerprintChanged: {
      login: hashAvailable ? beforeLogin.passwordHashFingerprint !== afterLogin.passwordHashFingerprint : null,
      authMe1: hashAvailable ? afterLogin.passwordHashFingerprint !== afterAuthMe1.passwordHashFingerprint : null,
      authMe2: hashAvailable ? afterAuthMe1.passwordHashFingerprint !== afterAuthMe2.passwordHashFingerprint : null,
      adminRoute: hashAvailable ? afterAuthMe2.passwordHashFingerprint !== afterAdminRoute.passwordHashFingerprint : null,
    },
  };

  const mutationDetected =
    deltas.passwordChangedAtChanged.login ||
    deltas.passwordChangedAtChanged.authMe1 ||
    deltas.passwordChangedAtChanged.authMe2 ||
    deltas.passwordChangedAtChanged.adminRoute ||
    (hashAvailable && (
      deltas.passwordHashFingerprintChanged.login === true ||
      deltas.passwordHashFingerprintChanged.authMe1 === true ||
      deltas.passwordHashFingerprintChanged.authMe2 === true ||
      deltas.passwordHashFingerprintChanged.adminRoute === true
    ));

  const picked = pickPhase(deltas);
  const phase = !hashAvailable && mutationDetected ? 'blocked_hash_fingerprint_unavailable' : picked.phase;
  const source = !hashAvailable && mutationDetected
    ? `${picked.source} | hash_fingerprint_unavailable`
    : picked.source;

  const bundle: RuntimeTraceBundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: mutationDetected ? 'FAIL' : 'PASS',
    mutationDetected,
    mutationPhase: phase,
    timeline: {
      beforeLogin,
      afterLogin,
      afterAuthMe1,
      afterAuthMe2,
      afterAdminRoute,
    },
    requestStatus: {
      bootstrapLogin: bootstrap.status,
      trackedLogin: tracked.status,
      authMe1,
      authMe2,
      adminRoute,
    },
    deltas,
    likelySourcePath: source,
    hashFingerprintAvailable: hashAvailable,
  };

  const proofDir = path.join(process.cwd(), 'proof');
  fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'runtime-user-mutation-trace.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(proofDir, 'runtime-user-mutation-trace.md'), `${toMarkdown(bundle)}\n`, 'utf8');

  const out = {
    overallStatus: bundle.overallStatus,
    step: 'trace:runtime-user-mutation',
    mutationPhase: bundle.mutationPhase,
    likelySourcePath: bundle.likelySourcePath,
    proof: 'proof/runtime-user-mutation-trace.json',
  };

  if (bundle.overallStatus === 'FAIL') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  const payload = {
    overallStatus: 'FAIL',
    step: 'trace:runtime-user-mutation',
    error: error instanceof Error ? error.message : String(error),
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
