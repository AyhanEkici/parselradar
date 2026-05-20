import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../src/models/User';

dotenv.config();

type TargetUser = {
  label: 'pilot' | 'AyhanEkici' | 'Mahir';
  expectedRole: 'ADMIN' | 'USER';
  emailEnv: string;
  passwordEnv: string;
};

type CompatibilityResult = {
  label: string;
  exists: boolean;
  emailNormalized: string;
  role: string;
  roleExpected: string;
  roleMatch: boolean;
  passwordProvided: boolean;
  passwordLength: number;
  hashPrefix: string;
  hashCost: number | null;
  hashLooksBcrypt: boolean;
  bcryptAsyncMatch: boolean;
  bcryptSyncMatch: boolean;
  normalizationSensitive: boolean;
  jwtIssued: boolean;
  jwtVerified: boolean;
  tokenIssuedSafe: boolean;
  rootCauseHints: string[];
};

function requireEnv(key: string): string {
  const value = String(process.env[key] || '').trim();
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function normalizeEmail(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function normalizePassword(value: string): string {
  return String(value || '').normalize('NFC').trim();
}

function hashPrefix(hash: string): string {
  return String(hash || '').slice(0, 4);
}

function hashCost(hash: string): number | null {
  const m = String(hash || '').match(/^\$2[abxy]\$(\d{2})\$/);
  if (!m) return null;
  return Number(m[1]);
}

function isBcryptHash(hash: string): boolean {
  return /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(String(hash || ''));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeDebug(event: string, payload: Record<string, unknown>) {
  if (process.env.AUTH_SAFE_DEBUG !== 'true') return;
  console.info(`[auth-debug] ${event}`, payload);
}

async function findUser(label: string, configuredEmail: string) {
  const normalized = normalizeEmail(configuredEmail);
  if (normalized) {
    let user = await User.findOne({ email: normalized });
    if (user) return { user, emailNormalized: normalized };
    user = await User.findOne({ email: { $regex: `^${escapeRegExp(normalized)}$`, $options: 'i' } });
    if (user) return { user, emailNormalized: normalized };
  }

  const byLabel = await User.findOne({
    $or: [{ email: { $regex: label, $options: 'i' } }, { name: { $regex: label, $options: 'i' } }],
  });
  return { user: byLabel, emailNormalized: normalized };
}

async function verifyOne(target: TargetUser): Promise<CompatibilityResult> {
  const configuredEmail = String(process.env[target.emailEnv] || '');
  const configuredPasswordRaw = String(process.env[target.passwordEnv] || '');
  const configuredPassword = normalizePassword(configuredPasswordRaw);

  const { user, emailNormalized } = await findUser(target.label, configuredEmail);
  if (!user) {
    safeDebug('password_compat_user_lookup', { label: target.label, emailNormalized, userFound: false });
    return {
      label: target.label,
      exists: false,
      emailNormalized,
      role: 'UNKNOWN',
      roleExpected: target.expectedRole,
      roleMatch: false,
      passwordProvided: configuredPassword.length > 0,
      passwordLength: configuredPassword.length,
      hashPrefix: 'NONE',
      hashCost: null,
      hashLooksBcrypt: false,
      bcryptAsyncMatch: false,
      bcryptSyncMatch: false,
      normalizationSensitive: false,
      jwtIssued: false,
      jwtVerified: false,
      tokenIssuedSafe: false,
      rootCauseHints: ['user_not_found'],
    };
  }

  const hash = String(user.passwordHash || '');
  const prefix = hashPrefix(hash);
  const cost = hashCost(hash);
  const looksBcrypt = isBcryptHash(hash);

  let asyncMatch = false;
  let syncMatch = false;
  let normalizationSensitive = false;
  const rootCauseHints: string[] = [];

  if (!configuredPassword) {
    rootCauseHints.push('missing_password_env_for_compare');
  } else {
    asyncMatch = await bcrypt.compare(configuredPassword, hash);
    syncMatch = bcrypt.compareSync(configuredPassword, hash);

    const rawPassword = configuredPasswordRaw;
    const trimmedMatch = await bcrypt.compare(String(rawPassword).trim(), hash);
    const normalizedNoTrimMatch = await bcrypt.compare(String(rawPassword).normalize('NFC'), hash);
    normalizationSensitive = !asyncMatch && (trimmedMatch || normalizedNoTrimMatch);

    if (!asyncMatch || !syncMatch) {
      rootCauseHints.push('bcrypt_compare_mismatch');
    }
    if (normalizationSensitive) {
      rootCauseHints.push('password_normalization_mismatch');
    }
  }

  if (!looksBcrypt) rootCauseHints.push('hash_format_invalid');
  if (cost === null) rootCauseHints.push('hash_cost_unreadable');
  if (configuredPassword.startsWith('$2')) rootCauseHints.push('double_hash_input_suspected');

  const role = String(user.role || 'UNKNOWN').toUpperCase();
  const roleMatch = role === target.expectedRole;
  if (!roleMatch) rootCauseHints.push('role_hydration_mismatch');

  let jwtIssued = false;
  let jwtVerified = false;
  if (asyncMatch && syncMatch) {
    const secret = String(process.env.JWT_SECRET || '').trim();
    if (secret) {
      const token = jwt.sign({ id: String(user._id), email: String(user.email), role }, secret, { expiresIn: '7d' });
      jwtIssued = Boolean(token);
      try {
        const verified = jwt.verify(token, secret) as { id?: string };
        jwtVerified = Boolean(verified?.id);
      } catch {
        jwtVerified = false;
      }
    } else {
      rootCauseHints.push('missing_jwt_secret');
    }
  }

  safeDebug('password_compat_result', {
    label: target.label,
    emailNormalized,
    userFound: true,
    bcryptCompareResult: asyncMatch && syncMatch,
    hashPrefix: prefix,
    passwordLength: configuredPassword.length,
    tokenIssued: jwtIssued,
    resolvedRole: role,
  });

  return {
    label: target.label,
    exists: true,
    emailNormalized,
    role,
    roleExpected: target.expectedRole,
    roleMatch,
    passwordProvided: configuredPassword.length > 0,
    passwordLength: configuredPassword.length,
    hashPrefix: prefix,
    hashCost: cost,
    hashLooksBcrypt: looksBcrypt,
    bcryptAsyncMatch: asyncMatch,
    bcryptSyncMatch: syncMatch,
    normalizationSensitive,
    jwtIssued,
    jwtVerified,
    tokenIssuedSafe: jwtIssued,
    rootCauseHints,
  };
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'password-compatibility-proof.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Password Compatibility Proof');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| User | Exists | Role | Hash Prefix | Hash Format | bcrypt async | bcrypt sync | JWT issued | JWT verified | Hints |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of bundle.results as CompatibilityResult[]) {
    lines.push(`| ${item.label} | ${item.exists ? 'true' : 'false'} | ${item.role} | ${item.hashPrefix} | ${item.hashLooksBcrypt ? 'valid' : 'invalid'} | ${item.bcryptAsyncMatch ? 'true' : 'false'} | ${item.bcryptSyncMatch ? 'true' : 'false'} | ${item.jwtIssued ? 'true' : 'false'} | ${item.jwtVerified ? 'true' : 'false'} | ${item.rootCauseHints.join(', ') || 'none'} |`);
  }
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'password-compatibility-proof.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  await mongoose.connect(mongoUri);

  try {
    const targets: TargetUser[] = [
      { label: 'pilot', expectedRole: 'ADMIN', emailEnv: 'SECURITY_VERIFY_PILOT_EMAIL', passwordEnv: 'SECURITY_VERIFY_PILOT_PASSWORD' },
      { label: 'AyhanEkici', expectedRole: 'ADMIN', emailEnv: 'SECURITY_VERIFY_AYHAN_EMAIL', passwordEnv: 'SECURITY_VERIFY_AYHAN_PASSWORD' },
      { label: 'Mahir', expectedRole: 'USER', emailEnv: 'SECURITY_VERIFY_MAHIR_EMAIL', passwordEnv: 'SECURITY_VERIFY_MAHIR_PASSWORD' },
    ];

    const results: CompatibilityResult[] = [];
    for (const target of targets) {
      results.push(await verifyOne(target));
    }

    const bcryptVersion = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'apps/api/package.json'), 'utf-8'))?.dependencies?.bcrypt || 'unknown';
    const allExist = results.every((item) => item.exists);
    const hashesValid = results.every((item) => item.hashLooksBcrypt);
    const bcryptPass = results.every((item) => item.bcryptAsyncMatch && item.bcryptSyncMatch);
    const jwtPass = results.every((item) => item.jwtIssued && item.jwtVerified);

    const bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus: allExist && hashesValid && bcryptPass && jwtPass ? 'PASS' : 'FAIL',
      bcryptVersion,
      results,
      proofs: {
        bcryptCompatibilityProof: {
          status: bcryptPass ? 'PASS' : 'FAIL',
          detail: bcryptPass
            ? 'bcrypt async/sync compare are consistent and passing for all required users.'
            : 'bcrypt compare failed for at least one required user.',
        },
        hashIntegrityProof: {
          status: hashesValid ? 'PASS' : 'FAIL',
          detail: hashesValid
            ? 'All password hashes match expected bcrypt prefix/cost format.'
            : 'One or more hashes do not match expected bcrypt format.',
        },
      },
      commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus: bundle.overallStatus, proofPath: 'proof/password-compatibility-proof.json' })}\n`);
    if (bundle.overallStatus !== 'PASS') process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    results: [],
    proofs: {
      bcryptCompatibilityProof: { status: 'FAIL', detail: error?.message || 'verify_passwords_failed' },
      hashIntegrityProof: { status: 'FAIL', detail: error?.message || 'verify_passwords_failed' },
    },
    blockedReason: error?.message || 'verify_passwords_failed',
  };
  writeProof(bundle);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'verify_passwords_failed' })}\n`);
  process.exit(1);
});
