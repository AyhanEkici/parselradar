import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User';

dotenv.config();

type KnownUser = {
  label: 'Ayhan' | 'Pilot' | 'Mahir';
  email: string;
  expectedRole: 'ADMIN' | 'USER';
};

type UserHashFieldResult = {
  label: string;
  exists: boolean;
  role: string;
  roleExpected: string;
  roleMatch: boolean;
  hasPasswordHash: boolean;
  hashPrefixValid: boolean;
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

function isBcryptPrefix(hash: string): boolean {
  return /^\$2[aby]\$/.test(String(hash || ''));
}

function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'passwordhash-auth-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PasswordHash Auth Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String((value as any).status || '')} | ${String((value as any).detail || '')} |`);
  }
  lines.push('');
  lines.push('| User | Exists | Role | Role Expected | passwordHash present | Hash prefix valid |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const item of bundle.userFieldChecks as UserHashFieldResult[]) {
    lines.push(`| ${item.label} | ${item.exists ? 'true' : 'false'} | ${item.role} | ${item.roleExpected} | ${item.hasPasswordHash ? 'true' : 'false'} | ${item.hashPrefixValid ? 'true' : 'false'} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'passwordhash-auth-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  const _jwtSecret = requireEnv('JWT_SECRET');

  await mongoose.connect(mongoUri);

  try {
    const knownUsers: KnownUser[] = [
      { label: 'Ayhan', email: 'ayhanekici@gmail.com', expectedRole: 'ADMIN' },
      { label: 'Pilot', email: 'pilot@test.com', expectedRole: 'ADMIN' },
      { label: 'Mahir', email: 'mmahir38@gmail.com', expectedRole: 'USER' },
    ];

    const checks: UserHashFieldResult[] = [];
    for (const known of knownUsers) {
      const user = await User.findOne({ email: normalizeEmail(known.email) }).select('+passwordHash').lean();
      const role = String(user?.role || 'UNKNOWN').toUpperCase();
      const hash = String((user as any)?.passwordHash || '');
      checks.push({
        label: known.label,
        exists: Boolean(user),
        role,
        roleExpected: known.expectedRole,
        roleMatch: role === known.expectedRole,
        hasPasswordHash: hash.length > 0,
        hashPrefixValid: isBcryptPrefix(hash),
      });
    }

    const schemaContent = readFileSafe(path.resolve(process.cwd(), 'apps/api/src/models/User.ts'));
    const authControllerContent = readFileSafe(path.resolve(process.cwd(), 'apps/api/src/controllers/authController.ts'));

    const userSchemaProofPass = /passwordHash\s*:\s*\{/.test(schemaContent);
    const authControllerPathPass = /bcrypt\.compare\(password,\s*user\.passwordHash\)/.test(authControllerContent);
    const noPasswordResetPass = !/bcrypt\.hash\(/.test(authControllerContent);

    const fieldPass = checks.every((item) => item.exists && item.hasPasswordHash && item.hashPrefixValid);

    const bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus: fieldPass && userSchemaProofPass && authControllerPathPass ? 'PASS' : 'FAIL',
      userFieldChecks: checks,
      proofs: {
        passwordHashFieldProof: {
          status: fieldPass ? 'PASS' : 'FAIL',
          detail: fieldPass
            ? 'Known users have passwordHash populated with bcrypt-compatible prefix.'
            : 'One or more known users are missing passwordHash or valid bcrypt prefix.',
        },
        userSchemaProof: {
          status: userSchemaProofPass ? 'PASS' : 'FAIL',
          detail: userSchemaProofPass ? 'User schema defines passwordHash field.' : 'User schema missing passwordHash field.',
        },
        authControllerPasswordHashProof: {
          status: authControllerPathPass ? 'PASS' : 'FAIL',
          detail: authControllerPathPass
            ? 'authController login compares password against user.passwordHash.'
            : 'authController login passwordHash compare path not detected.',
        },
        noPasswordResetProof: {
          status: noPasswordResetPass ? 'PASS' : 'FAIL',
          detail: noPasswordResetPass
            ? 'authController does not overwrite existing password hashes during login path.'
            : 'Potential password reset behavior detected in login path.',
        },
      },
      commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus: bundle.overallStatus, proofPath: 'proof/passwordhash-auth-proof-bundle.json' })}\n`);
    if (bundle.overallStatus !== 'PASS') process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    userFieldChecks: [],
    proofs: {
      passwordHashFieldProof: { status: 'FAIL', detail: error?.message || 'verify_passwordhash_failed' },
      userSchemaProof: { status: 'FAIL', detail: error?.message || 'verify_passwordhash_failed' },
      authControllerPasswordHashProof: { status: 'FAIL', detail: error?.message || 'verify_passwordhash_failed' },
      noPasswordResetProof: { status: 'FAIL', detail: error?.message || 'verify_passwordhash_failed' },
    },
    blockedReason: error?.message || 'verify_passwordhash_failed',
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
  };
  writeProof(bundle);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'verify_passwordhash_failed' })}\n`);
  process.exit(1);
});
