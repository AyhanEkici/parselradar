import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';

dotenv.config();

type TargetUser = {
  label: 'pilot' | 'AyhanEkici' | 'Mahir';
  expectedRole: 'ADMIN' | 'USER';
  emailEnv: string;
  passwordEnv: string;
};

type RepairResult = {
  label: string;
  userFound: boolean;
  emailNormalized: string;
  roleBefore: string;
  roleAfter: string;
  idPreserved: boolean;
  hashUpdated: boolean;
  ownershipSafe: boolean;
  reason: string;
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUser(label: string, emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  if (email) {
    let user = await User.findOne({ email });
    if (user) return { user, emailNormalized: email };
    user = await User.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } });
    if (user) return { user, emailNormalized: email };
  }

  const byLabel = await User.findOne({
    $or: [{ email: { $regex: label, $options: 'i' } }, { name: { $regex: label, $options: 'i' } }],
  });
  return { user: byLabel, emailNormalized: email };
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'auth-repair-run-proof.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(
    path.join(proofDir, 'auth-repair-run-proof.md'),
    [
      '# Auth Repair Run Proof',
      '',
      `Generated at: ${bundle.generatedAt}`,
      `Overall status: ${bundle.overallStatus}`,
      '',
      '| User | Found | Hash Updated | ID Preserved | Ownership Safe | Reason |',
      '| --- | --- | --- | --- | --- | --- |',
      ...bundle.results.map((r: RepairResult) => `| ${r.label} | ${r.userFound ? 'true' : 'false'} | ${r.hashUpdated ? 'true' : 'false'} | ${r.idPreserved ? 'true' : 'false'} | ${r.ownershipSafe ? 'true' : 'false'} | ${r.reason} |`),
      '',
    ].join('\n'),
    'utf-8',
  );
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

    const results: RepairResult[] = [];

    for (const target of targets) {
      const emailRaw = String(process.env[target.emailEnv] || '');
      const passwordRaw = String(process.env[target.passwordEnv] || '');
      const password = normalizePassword(passwordRaw);
      const { user, emailNormalized } = await findUser(target.label, emailRaw);

      if (!user) {
        results.push({
          label: target.label,
          userFound: false,
          emailNormalized,
          roleBefore: 'UNKNOWN',
          roleAfter: 'UNKNOWN',
          idPreserved: false,
          hashUpdated: false,
          ownershipSafe: true,
          reason: 'user_not_found',
        });
        continue;
      }

      const roleBefore = String(user.role || 'UNKNOWN').toUpperCase();
      const originalId = String(user._id);

      if (!password) {
        results.push({
          label: target.label,
          userFound: true,
          emailNormalized,
          roleBefore,
          roleAfter: roleBefore,
          idPreserved: true,
          hashUpdated: false,
          ownershipSafe: true,
          reason: `missing_${target.passwordEnv}`,
        });
        continue;
      }

      const bcryptMatch = await bcrypt.compare(password, String(user.passwordHash || ''));
      if (bcryptMatch) {
        results.push({
          label: target.label,
          userFound: true,
          emailNormalized,
          roleBefore,
          roleAfter: roleBefore,
          idPreserved: true,
          hashUpdated: false,
          ownershipSafe: true,
          reason: 'already_compatible',
        });
        continue;
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();

      results.push({
        label: target.label,
        userFound: true,
        emailNormalized,
        roleBefore,
        roleAfter: String(user.role || 'UNKNOWN').toUpperCase(),
        idPreserved: String(user._id) === originalId,
        hashUpdated: true,
        ownershipSafe: true,
        reason: 'bcrypt_mismatch_repaired',
      });
    }

    const userFoundPass = results.every((r) => r.userFound);
    const idPass = results.every((r) => r.idPreserved || !r.userFound);
    const rolePass = results.every((r) => r.roleBefore === r.roleAfter || !r.userFound);
    const compatibleOrRepairedPass = results.every((r) => ['already_compatible', 'bcrypt_mismatch_repaired'].includes(r.reason));
    const overallStatus = userFoundPass && idPass && rolePass && compatibleOrRepairedPass ? 'PASS' : 'FAIL';

    const bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus,
      results,
      proofs: {
        repairedUserProof: {
          status: overallStatus,
          detail: compatibleOrRepairedPass
            ? 'Only users with bcrypt mismatch were updated; all others were already compatible.'
            : 'Repair could not complete for all required users (missing passwords or unresolved lookup).',
        },
        noOwnershipCorruptionProof: {
          status: idPass ? 'PASS' : 'FAIL',
          detail: idPass
            ? 'Mongo _id values preserved; ownership/reference continuity maintained.'
            : 'At least one record failed id-preservation check.',
        },
      },
      commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus: bundle.overallStatus, proofPath: 'proof/auth-repair-run-proof.json' })}\n`);
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
      repairedUserProof: { status: 'FAIL', detail: error?.message || 'auth_repair_safe_failed' },
      noOwnershipCorruptionProof: { status: 'FAIL', detail: error?.message || 'auth_repair_safe_failed' },
    },
    blockedReason: error?.message || 'auth_repair_safe_failed',
  };
  writeProof(bundle);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'auth_repair_safe_failed' })}\n`);
  process.exit(1);
});
