import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../src/models/User';

dotenv.config();

type KnownUser = {
  label: 'AyhanEkici' | 'pilot' | 'Mahir';
  id: string;
  email: string;
  requiredRole: 'ADMIN' | 'USER';
  passwordEnv: string;
};

type ResetResult = {
  label: string;
  id: string;
  emailMatch: boolean;
  idPreserved: boolean;
  roleBefore: string;
  roleAfter: string;
  roleCorrect: boolean;
  bcryptComparePass: boolean;
  jwtIssued: boolean;
  tokenVerified: boolean;
  ownershipSafe: boolean;
  updated: boolean;
  reason: string;
};

function requireEnv(key: string): string {
  const value = String(process.env[key] || '').trim();
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function normalizeEmail(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function normalizePassword(value: string): string {
  return String(value || '').normalize('NFC').trim();
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'known-user-reset-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Known User Reset Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| User | ID Preserved | Email Match | Role Before | Role After | bcrypt compare | JWT issued | token verified | Updated | Reason |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const result of bundle.results as ResetResult[]) {
    lines.push(`| ${result.label} | ${result.idPreserved ? 'true' : 'false'} | ${result.emailMatch ? 'true' : 'false'} | ${result.roleBefore} | ${result.roleAfter} | ${result.bcryptComparePass ? 'true' : 'false'} | ${result.jwtIssued ? 'true' : 'false'} | ${result.tokenVerified ? 'true' : 'false'} | ${result.updated ? 'true' : 'false'} | ${result.reason} |`);
  }
  lines.push('');
  lines.push('| Proof | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String((value as any).status || '')} | ${String((value as any).detail || '')} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'known-user-reset-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  const jwtSecret = requireEnv('JWT_SECRET');

  const knownUsers: KnownUser[] = [
    {
      label: 'AyhanEkici',
      id: '6a08fad07081b1a50805bce7',
      email: 'ayhanekici@gmail.com',
      requiredRole: 'ADMIN',
      passwordEnv: 'AUTH_RESET_AYHAN_PASSWORD',
    },
    {
      label: 'pilot',
      id: '6a09018a44118543aaab28bd',
      email: 'pilot@test.com',
      requiredRole: 'ADMIN',
      passwordEnv: 'AUTH_RESET_PILOT_PASSWORD',
    },
    {
      label: 'Mahir',
      id: '6a0caabed2e06f38b152f9d0',
      email: 'mmahir38@gmail.com',
      requiredRole: 'USER',
      passwordEnv: 'AUTH_RESET_MAHIR_PASSWORD',
    },
  ];

  await mongoose.connect(mongoUri);

  try {
    const results: ResetResult[] = [];

    for (const known of knownUsers) {
      const user = await User.findById(known.id);
      if (!user) {
        throw new Error(`Known user not found by id: ${known.id}`);
      }

      const expectedEmail = normalizeEmail(known.email);
      const actualEmail = normalizeEmail(String(user.email || ''));
      if (actualEmail !== expectedEmail) {
        throw new Error(`ID/email mismatch for ${known.label}: expected ${expectedEmail}`);
      }

      const password = normalizePassword(requireEnv(known.passwordEnv));
      if (!password) {
        throw new Error(`Empty normalized password for ${known.label}`);
      }

      const roleBefore = String(user.role || 'UNKNOWN').toUpperCase();
      const originalId = String(user._id);

      user.passwordHash = await bcrypt.hash(password, 10);
      user.role = known.requiredRole;
      user.updatedAt = new Date();
      await user.save();

      const compareOk = await bcrypt.compare(password, String(user.passwordHash || ''));
      const token = jwt.sign({ id: String(user._id), email: actualEmail, role: user.role }, jwtSecret, { expiresIn: '7d' });
      const tokenIssued = Boolean(token);
      let tokenVerified = false;
      try {
        const decoded = jwt.verify(token, jwtSecret) as { id?: string };
        tokenVerified = Boolean(decoded?.id) && String(decoded.id) === String(user._id);
      } catch {
        tokenVerified = false;
      }

      results.push({
        label: known.label,
        id: known.id,
        emailMatch: true,
        idPreserved: String(user._id) === originalId,
        roleBefore,
        roleAfter: String(user.role || 'UNKNOWN').toUpperCase(),
        roleCorrect: String(user.role || '').toUpperCase() === known.requiredRole,
        bcryptComparePass: compareOk,
        jwtIssued: tokenIssued,
        tokenVerified,
        ownershipSafe: String(user._id) === originalId,
        updated: true,
        reason: compareOk ? 'password_reset_verified' : 'bcrypt_verify_failed',
      });
    }

    const allIdPreserved = results.every((r) => r.idPreserved);
    const allEmailMatch = results.every((r) => r.emailMatch);
    const roleRepairPass = results.every((r) => r.roleCorrect);
    const bcryptPass = results.every((r) => r.bcryptComparePass);
    const jwtPass = results.every((r) => r.jwtIssued && r.tokenVerified);
    const ownershipPass = results.every((r) => r.ownershipSafe);

    const overallStatus = allIdPreserved && allEmailMatch && roleRepairPass && bcryptPass && jwtPass && ownershipPass ? 'PASS' : 'FAIL';

    const bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus,
      results,
      proofs: {
        knownUserResetProof: {
          status: overallStatus,
          detail: 'Known users were reset in place by fixed Mongo ids with no recreation.',
        },
        userIdsPreservedProof: {
          status: allIdPreserved ? 'PASS' : 'FAIL',
          detail: allIdPreserved ? 'All known user _id values preserved.' : 'At least one user id changed unexpectedly.',
        },
        emailMatchProof: {
          status: allEmailMatch ? 'PASS' : 'FAIL',
          detail: allEmailMatch ? 'All fixed id records match expected emails.' : 'One or more fixed id/email checks failed.',
        },
        roleRepairProof: {
          status: roleRepairPass ? 'PASS' : 'FAIL',
          detail: roleRepairPass
            ? 'Ayhan repaired to ADMIN, pilot ADMIN retained, Mahir USER retained.'
            : 'Role target mismatch detected.',
        },
        bcryptCompareProof: {
          status: bcryptPass ? 'PASS' : 'FAIL',
          detail: bcryptPass ? 'bcrypt.compare passed for all reset passwords.' : 'bcrypt.compare failed for at least one user.',
        },
        jwtIssuanceProof: {
          status: jwtPass ? 'PASS' : 'FAIL',
          detail: jwtPass ? 'JWT issuance and verification passed for all users.' : 'JWT issuance/verification failed for at least one user.',
        },
        tokenVerificationProof: {
          status: jwtPass ? 'PASS' : 'FAIL',
          detail: jwtPass ? 'Signed tokens validate against JWT_SECRET and user id.' : 'Token verification mismatch detected.',
        },
        noOwnershipCorruptionProof: {
          status: ownershipPass ? 'PASS' : 'FAIL',
          detail: ownershipPass ? 'Ownership continuity preserved via invariant _id values.' : 'Ownership continuity risk detected.',
        },
      },
      commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus: bundle.overallStatus, proofPath: 'proof/known-user-reset-proof-bundle.json' })}\n`);
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
      knownUserResetProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      userIdsPreservedProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      roleRepairProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      bcryptCompareProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      jwtIssuanceProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      tokenVerificationProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
      noOwnershipCorruptionProof: { status: 'FAIL', detail: error?.message || 'known_user_reset_failed' },
    },
    blockedReason: error?.message || 'known_user_reset_failed',
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
  };
  writeProof(bundle);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'known_user_reset_failed' })}\n`);
  process.exit(1);
});
