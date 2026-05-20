import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';

dotenv.config();

function requireEnv(key: string): string {
  const value = String(process.env[key] || '').trim();
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function parseEmailArg(): string {
  const arg = process.argv.find((item) => item.startsWith('--email='));
  if (!arg) {
    throw new Error('Missing required argument --email=<email>');
  }
  return String(arg.split('=')[1] || '').trim().toLowerCase();
}

function resolvePasswordEnv(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes('pilot')) return 'SECURITY_VERIFY_PILOT_PASSWORD';
  if (lower.includes('ayhan')) return 'SECURITY_VERIFY_AYHAN_PASSWORD';
  if (lower.includes('mahir')) return 'SECURITY_VERIFY_MAHIR_PASSWORD';
  return 'AUTH_REPAIR_PASSWORD';
}

function writeRepairProof(payload: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) {
    fs.mkdirSync(proofDir, { recursive: true });
  }
  fs.writeFileSync(path.join(proofDir, 'auth-repair-proof.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');

  const lines = [
    '# Auth Repair Proof',
    '',
    `Generated at: ${payload.generatedAt}`,
    `Status: ${payload.status}`,
    `User found: ${payload.userFound}`,
    `Email: ${payload.email}`,
    `Updated hash: ${payload.updatedHash ? 'true' : 'false'}`,
    `Preserved id: ${payload.preservedId ? 'true' : 'false'}`,
    `Message: ${payload.message}`,
    '',
  ];
  fs.writeFileSync(path.join(proofDir, 'auth-repair-proof.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  const email = parseEmailArg();
  const passwordEnvKey = resolvePasswordEnv(email);
  const newPassword = requireEnv(passwordEnvKey);

  await mongoose.connect(mongoUri);

  try {
    const user = await User.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (!user) {
      const payload = {
        generatedAt: new Date().toISOString(),
        status: 'FAIL',
        userFound: false,
        email,
        updatedHash: false,
        preservedId: false,
        message: 'User not found; no mutation executed.',
      };
      writeRepairProof(payload);
      process.stderr.write(`${JSON.stringify(payload)}\n`);
      process.exit(1);
    }

    const originalId = String(user._id);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    const payload = {
      generatedAt: new Date().toISOString(),
      status: 'PASS',
      userFound: true,
      email: String(user.email),
      updatedHash: true,
      preservedId: String(user._id) === originalId,
      message: 'Single-user password hash repaired without changing ownership identifiers.',
    };
    writeRepairProof(payload);
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error: any) => {
  const payload = {
    generatedAt: new Date().toISOString(),
    status: 'FAIL',
    userFound: false,
    email: '',
    updatedHash: false,
    preservedId: false,
    message: error?.message || 'auth_repair_failed',
  };
  writeRepairProof(payload);
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.exit(1);
});
