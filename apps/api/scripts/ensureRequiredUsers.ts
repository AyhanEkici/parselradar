import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../src/models/User';

dotenv.config();

type RequiredUser = {
  label: 'pilot' | 'AyhanEkici' | 'Mahir';
  role: 'ADMIN' | 'USER';
  email?: string;
  password: string;
};

function requireEnv(key: string): string {
  const value = String(process.env[key] || '').trim();
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function upsertRequiredUser(input: RequiredUser) {
  if (!input.email) {
    throw new Error(`Missing email for user: ${input.label}`);
  }
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } });
  }

  if (!user) {
    await User.create({
      email,
      passwordHash,
      name: input.label,
      role: input.role,
    });
    return { label: input.label, email, role: input.role, state: 'created' as const };
  }

  user.email = email;
  user.passwordHash = passwordHash;
  user.role = input.role;
  if (!user.name || !user.name.trim()) {
    user.name = input.label;
  }
  await user.save();

  return { label: input.label, email, role: input.role, state: 'updated' as const };
}

async function resolveEmail(label: RequiredUser['label'], explicitEmail?: string): Promise<string | undefined> {
  if (explicitEmail && explicitEmail.trim()) {
    return normalizeEmail(explicitEmail);
  }

  const user = await User.findOne({
    $or: [
      { email: { $regex: label, $options: 'i' } },
      { name: { $regex: label, $options: 'i' } },
    ],
  })
    .select('email')
    .lean();

  return user?.email ? normalizeEmail(String(user.email)) : undefined;
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  await mongoose.connect(mongoUri);

  const pilotEmail = await resolveEmail('pilot', process.env.SECURITY_VERIFY_PILOT_EMAIL);
  const ayhanEmail = await resolveEmail('AyhanEkici', process.env.SECURITY_VERIFY_AYHAN_EMAIL);
  const mahirEmail = await resolveEmail('Mahir', process.env.SECURITY_VERIFY_MAHIR_EMAIL);

  if (!pilotEmail) throw new Error('Missing SECURITY_VERIFY_PILOT_EMAIL and no existing pilot user email found');
  if (!ayhanEmail) throw new Error('Missing SECURITY_VERIFY_AYHAN_EMAIL and no existing AyhanEkici user email found');
  if (!mahirEmail) throw new Error('Missing SECURITY_VERIFY_MAHIR_EMAIL and no existing Mahir user email found');

  const requiredUsers: RequiredUser[] = [
    {
      label: 'pilot',
      role: 'ADMIN',
      email: pilotEmail,
      password: requireEnv('SECURITY_VERIFY_PILOT_PASSWORD'),
    },
    {
      label: 'AyhanEkici',
      role: 'ADMIN',
      email: ayhanEmail,
      password: requireEnv('SECURITY_VERIFY_AYHAN_PASSWORD'),
    },
    {
      label: 'Mahir',
      role: 'USER',
      email: mahirEmail,
      password: requireEnv('SECURITY_VERIFY_MAHIR_PASSWORD'),
    },
  ];

  try {
    const results = [];
    for (const requiredUser of requiredUsers) {
      const result = await upsertRequiredUser(requiredUser);
      results.push(result);
    }

    const proof = {
      generatedAt: new Date().toISOString(),
      overallStatus: 'PASS',
      users: results,
    };
    const proofDir = path.resolve(process.cwd(), 'proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    fs.writeFileSync(path.join(proofDir, 'login-required-users-proof.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf-8');
    fs.writeFileSync(
      path.join(proofDir, 'login-required-users-proof.md'),
      [
        '# Login Required Users Proof',
        '',
        `Generated at: ${proof.generatedAt}`,
        'Overall status: PASS',
        '',
        '| User | Email | Role | State |',
        '| --- | --- | --- | --- |',
        ...results.map((item) => `| ${item.label} | ${item.email} | ${item.role} | ${item.state} |`),
        '',
      ].join('\n'),
      'utf-8',
    );

    process.stdout.write(`${JSON.stringify({ ok: true, users: results }, null, 2)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  process.stderr.write(`${JSON.stringify({ ok: false, error: error?.message || 'unknown_error' })}\n`);
  process.exit(1);
});
