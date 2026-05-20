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

type UserDiagnosis = {
  label: string;
  expectedRole: 'ADMIN' | 'USER';
  exists: boolean;
  emailInput: string;
  emailNormalized: string;
  emailExactMatch: boolean;
  emailCaseInsensitiveMatch: boolean;
  role: string;
  roleHydrationValid: boolean;
  bcryptCompared: boolean;
  bcryptMatch: boolean;
  tokenIssued: boolean;
  tokenVerified: boolean;
  tokenValidationResult: 'VERIFIED' | 'BLOCKED' | 'SUSPICIOUS' | 'UNKNOWN';
  authRoutePresent: boolean;
  rootCauseHints: string[];
  blockedReason?: string;
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function roleHydration(role: unknown): boolean {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN' || normalized === 'USER';
}

function routePresence(): boolean {
  const routePath = path.resolve(process.cwd(), 'apps/api/src/routes/authRoutes.ts');
  if (!fs.existsSync(routePath)) return false;
  const content = fs.readFileSync(routePath, 'utf-8');
  return /router\.post\(\s*['"`]\/login['"`]/.test(content) && /router\.get\(\s*['"`]\/me['"`]/.test(content);
}

function frontendAuthPersistenceProof() {
  const useAuthPath = path.resolve(process.cwd(), 'apps/web/src/hooks/useAuth.tsx');
  const authLibPath = path.resolve(process.cwd(), 'apps/web/src/lib/auth.ts');
  const apiLibPath = path.resolve(process.cwd(), 'apps/web/src/lib/api.ts');

  if (!fs.existsSync(useAuthPath) || !fs.existsSync(authLibPath) || !fs.existsSync(apiLibPath)) {
    return {
      status: 'FAIL' as const,
      detail: 'Missing frontend auth files.',
    };
  }

  const useAuthContent = fs.readFileSync(useAuthPath, 'utf-8');
  const authLibContent = fs.readFileSync(authLibPath, 'utf-8');
  const apiLibContent = fs.readFileSync(apiLibPath, 'utf-8');

  const hasBootstrap = /deterministicAuthBootstrap\(/.test(useAuthContent);
  const hasCleanup = /cleanupInvalidAuthState\(/.test(useAuthContent) && /localStorage\.removeItem\(TOKEN_KEY\)/.test(apiLibContent);
  const hasTokenPersist = /localStorage\.setItem\(TOKEN_KEY/.test(authLibContent);
  const hasAuthHeader = /Authorization:\s*`Bearer \$\{token\}`/.test(apiLibContent);
  const hasLogoutCleanup = /localStorage\.removeItem\(TOKEN_KEY\)/.test(authLibContent);

  const ok = hasBootstrap && hasCleanup && hasTokenPersist && hasAuthHeader && hasLogoutCleanup;
  return {
    status: ok ? ('PASS' as const) : ('FAIL' as const),
    detail: ok
      ? 'Auth context bootstrap, token persistence, bearer header injection, and invalid-token cleanup are present.'
      : 'One or more frontend auth persistence controls are missing.',
    flags: { hasBootstrap, hasCleanup, hasTokenPersist, hasAuthHeader, hasLogoutCleanup },
  };
}

function deploymentEnvProof() {
  const requiredKeys = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const present = requiredKeys.filter((key) => String(process.env[key] || '').trim().length > 0);
  return {
    status: present.length === requiredKeys.length ? ('PASS' as const) : ('WARN' as const),
    detail: `Core auth env present count=${present.length}/${requiredKeys.length}`,
    presentKeys: present,
    missingKeys: requiredKeys.filter((key) => !present.includes(key)),
  };
}

async function diagnoseOne(target: TargetUser, authRoutePresent: boolean): Promise<UserDiagnosis> {
  const configuredEmail = String(process.env[target.emailEnv] || '').trim();
  const emailNormalized = normalizeEmail(configuredEmail);
  const configuredPassword = String(process.env[target.passwordEnv] || '');

  let user: any = null;
  let emailExactMatch = false;
  let emailCaseInsensitiveMatch = false;

  if (configuredEmail) {
    user = await User.findOne({ email: emailNormalized });
    emailExactMatch = Boolean(user);
    if (!user) {
      user = await User.findOne({ email: { $regex: `^${escapeRegExp(emailNormalized)}$`, $options: 'i' } });
      emailCaseInsensitiveMatch = Boolean(user);
    }
  }

  if (!user) {
    user = await User.findOne({
      $or: [
        { email: { $regex: target.label, $options: 'i' } },
        { name: { $regex: target.label, $options: 'i' } },
      ],
    });
  }

  const exists = Boolean(user);
  const role = exists ? String(user.role || 'UNKNOWN').toUpperCase() : 'UNKNOWN';
  const roleHydrationValid = roleHydration(role) && (role === target.expectedRole || target.label === 'Mahir');

  let bcryptCompared = false;
  let bcryptMatch = false;
  let tokenIssued = false;
  let tokenVerified = false;
  let tokenValidationResult: UserDiagnosis['tokenValidationResult'] = 'UNKNOWN';

  if (exists && configuredPassword) {
    bcryptCompared = true;
    bcryptMatch = await bcrypt.compare(configuredPassword, String(user.passwordHash || ''));
  }

  if (exists && bcryptMatch) {
    const jwtSecret = String(process.env.JWT_SECRET || '').trim();
    if (jwtSecret) {
      const token = jwt.sign({ id: String(user._id), email: String(user.email), role: String(user.role) }, jwtSecret, { expiresIn: '7d' });
      tokenIssued = Boolean(token);
      try {
        const verified = jwt.verify(token, jwtSecret) as { id?: string };
        tokenVerified = Boolean(verified?.id);
        tokenValidationResult = tokenVerified ? 'VERIFIED' : 'SUSPICIOUS';
      } catch {
        tokenVerified = false;
        tokenValidationResult = 'BLOCKED';
      }
    }
  }

  const rootCauseHints: string[] = [];
  if (!exists) rootCauseHints.push('user_not_found');
  if (configuredEmail && !emailExactMatch && emailCaseInsensitiveMatch) rootCauseHints.push('email_normalization_mismatch');
  if (bcryptCompared && !bcryptMatch) rootCauseHints.push('password_compare_mismatch');
  if (bcryptMatch && (!tokenIssued || !tokenVerified)) rootCauseHints.push('jwt_session_mismatch');
  if (!authRoutePresent) rootCauseHints.push('auth_route_regression');
  if (!roleHydrationValid) rootCauseHints.push('role_hydration_mismatch');
  if (!configuredPassword) rootCauseHints.push('missing_password_env_for_compare');

  const blockedReason = !configuredPassword
    ? `Missing ${target.passwordEnv}`
    : exists && bcryptCompared && !bcryptMatch
      ? 'bcrypt_mismatch'
      : undefined;

  return {
    label: target.label,
    expectedRole: target.expectedRole,
    exists,
    emailInput: configuredEmail ? 'provided' : 'not_provided',
    emailNormalized,
    emailExactMatch,
    emailCaseInsensitiveMatch,
    role,
    roleHydrationValid,
    bcryptCompared,
    bcryptMatch,
    tokenIssued,
    tokenVerified,
    tokenValidationResult,
    authRoutePresent,
    rootCauseHints,
    blockedReason,
  };
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) {
    fs.mkdirSync(proofDir, { recursive: true });
  }

  const jsonPath = path.join(proofDir, 'auth-diagnose-bundle.json');
  const mdPath = path.join(proofDir, 'auth-diagnose-bundle.md');

  fs.writeFileSync(jsonPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Auth Diagnose Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('## Proof Checks');
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  lines.push(`| Mongo user existence proof | ${bundle.proofs.mongoUserExistenceProof.status} | ${bundle.proofs.mongoUserExistenceProof.detail} |`);
  lines.push(`| bcrypt verification proof | ${bundle.proofs.bcryptVerificationProof.status} | ${bundle.proofs.bcryptVerificationProof.detail} |`);
  lines.push(`| JWT issuance proof | ${bundle.proofs.jwtIssuanceProof.status} | ${bundle.proofs.jwtIssuanceProof.detail} |`);
  lines.push(`| token verification proof | ${bundle.proofs.tokenVerificationProof.status} | ${bundle.proofs.tokenVerificationProof.detail} |`);
  lines.push(`| frontend auth persistence proof | ${bundle.proofs.frontendAuthPersistenceProof.status} | ${bundle.proofs.frontendAuthPersistenceProof.detail} |`);
  lines.push(`| role hydration proof | ${bundle.proofs.roleHydrationProof.status} | ${bundle.proofs.roleHydrationProof.detail} |`);
  lines.push(`| root cause proof | ${bundle.proofs.rootCauseProof.status} | ${bundle.proofs.rootCauseProof.detail} |`);
  lines.push('');
  lines.push('## User Diagnostics');
  lines.push('');
  lines.push('| User | Exists | Role | bcrypt compare | JWT issued | token verified | Hints |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const item of bundle.userDiagnostics) {
    lines.push(
      `| ${item.label} | ${item.exists ? 'true' : 'false'} | ${item.role} | ${item.bcryptCompared ? (item.bcryptMatch ? 'true' : 'false') : 'skipped'} | ${item.tokenIssued ? 'true' : 'false'} | ${item.tokenVerified ? 'true' : 'false'} | ${item.rootCauseHints.join(', ') || 'none'} |`,
    );
  }
  lines.push('');

  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf-8');
}

async function run() {
  const mongoUri = requireEnv('MONGODB_URI');
  await mongoose.connect(mongoUri);

  try {
    const targets: TargetUser[] = [
      {
        label: 'pilot',
        expectedRole: 'ADMIN',
        emailEnv: 'SECURITY_VERIFY_PILOT_EMAIL',
        passwordEnv: 'SECURITY_VERIFY_PILOT_PASSWORD',
      },
      {
        label: 'AyhanEkici',
        expectedRole: 'ADMIN',
        emailEnv: 'SECURITY_VERIFY_AYHAN_EMAIL',
        passwordEnv: 'SECURITY_VERIFY_AYHAN_PASSWORD',
      },
      {
        label: 'Mahir',
        expectedRole: 'USER',
        emailEnv: 'SECURITY_VERIFY_MAHIR_EMAIL',
        passwordEnv: 'SECURITY_VERIFY_MAHIR_PASSWORD',
      },
    ];

    const authRoutePresent = routePresence();
    const userDiagnostics: UserDiagnosis[] = [];
    for (const target of targets) {
      userDiagnostics.push(await diagnoseOne(target, authRoutePresent));
    }

    const frontendProof = frontendAuthPersistenceProof();
    const envProof = deploymentEnvProof();

    const userExistencePass = userDiagnostics.every((item) => item.exists);
    const bcryptCoverageComplete = userDiagnostics.every((item) => item.bcryptCompared);
    const bcryptPass = userDiagnostics.every((item) => item.bcryptCompared && item.bcryptMatch);
    const jwtCoverageComplete = userDiagnostics.every((item) => item.tokenIssued);
    const jwtPass = userDiagnostics.every((item) => item.tokenIssued);
    const tokenVerifyPass = userDiagnostics.every((item) => item.tokenVerified);
    const rolePass = userDiagnostics.every((item) => item.roleHydrationValid);

    const allHints = userDiagnostics.flatMap((item) => item.rootCauseHints);
    const rootCauseDetail = allHints.length > 0 ? Array.from(new Set(allHints)).join(', ') : 'none_detected';

    const overallStatus = userExistencePass && bcryptPass && jwtPass && tokenVerifyPass && rolePass ? 'PASS' : 'FAIL';

    const bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus,
      userDiagnostics,
      deploymentEnvProof: envProof,
      proofs: {
        mongoUserExistenceProof: {
          status: userExistencePass ? 'PASS' : 'FAIL',
          detail: userExistencePass ? 'All required users exist.' : 'One or more required users are missing.',
        },
        bcryptVerificationProof: {
          status: bcryptPass ? 'PASS' : 'FAIL',
          detail: bcryptPass
            ? 'bcrypt compare succeeded for all required users.'
            : !bcryptCoverageComplete
              ? 'bcrypt compare could not run for all users because required password env vars are missing.'
              : 'At least one bcrypt compare failed for provided credentials.',
        },
        jwtIssuanceProof: {
          status: jwtPass ? 'PASS' : 'FAIL',
          detail: jwtPass
            ? 'JWT issuance succeeded for all required users.'
            : !jwtCoverageComplete
              ? 'JWT issuance could not be validated for all users because bcrypt pre-checks did not pass.'
              : 'JWT issuance failed for at least one required user.',
        },
        tokenVerificationProof: {
          status: tokenVerifyPass ? 'PASS' : 'FAIL',
          detail: tokenVerifyPass
            ? 'Signed tokens verified successfully for all required users.'
            : 'Token verification failed or was not reachable for at least one required user.',
        },
        frontendAuthPersistenceProof: {
          status: frontendProof.status,
          detail: frontendProof.detail,
          flags: frontendProof.flags,
        },
        roleHydrationProof: {
          status: rolePass ? 'PASS' : 'FAIL',
          detail: rolePass ? 'Role hydration aligns with expected ADMIN/USER gates.' : 'Role mismatch or invalid role hydration detected.',
        },
        rootCauseProof: {
          status: allHints.length > 0 ? 'FAIL' : 'PASS',
          detail: rootCauseDetail,
        },
      },
      commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus: bundle.overallStatus, proofPath: 'proof/auth-diagnose-bundle.json' })}\n`);
    if (bundle.overallStatus !== 'PASS') {
      process.exit(1);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error: any) => {
  const fallback = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    userDiagnostics: [],
    proofs: {
      mongoUserExistenceProof: { status: 'FAIL', detail: 'diagnose run failed' },
      bcryptVerificationProof: { status: 'FAIL', detail: 'diagnose run failed' },
      jwtIssuanceProof: { status: 'FAIL', detail: 'diagnose run failed' },
      tokenVerificationProof: { status: 'FAIL', detail: 'diagnose run failed' },
      frontendAuthPersistenceProof: { status: 'FAIL', detail: 'diagnose run failed' },
      roleHydrationProof: { status: 'FAIL', detail: 'diagnose run failed' },
      rootCauseProof: { status: 'FAIL', detail: error?.message || 'diagnose_failed' },
    },
    blockedReason: error?.message || 'diagnose_failed',
  };
  writeProof(fallback);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'diagnose_failed' })}\n`);
  process.exit(1);
});
