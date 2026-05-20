import fs from 'fs';
import path from 'path';
import {
  CheckStatus,
  makeCheck,
  PROOF_ROOT,
  repoPath,
  VerificationCheck,
} from './platformVerification';

interface LoginEvidence {
  userLabel: string;
  emailPresent: boolean;
  passwordPresent: boolean;
  loginStatus: 'PASS' | 'WARN' | 'FAIL' | 'SKIPPED';
  meStatus: 'PASS' | 'WARN' | 'FAIL' | 'SKIPPED';
  detail: string;
}

interface SecurityProofBundle {
  generatedAt: string;
  overallStatus: CheckStatus;
  checks: VerificationCheck[];
  authReliability: LoginEvidence[];
}

function statusRank(status: CheckStatus): number {
  if (status === 'FAIL') return 0;
  if (status === 'WARN') return 1;
  if (status === 'SKIPPED') return 2;
  return 3;
}

function overallStatus(checks: VerificationCheck[]): CheckStatus {
  let best: CheckStatus = 'PASS';
  for (const check of checks) {
    if (statusRank(check.status) < statusRank(best)) {
      best = check.status;
    }
  }
  return best;
}

function fileCheck(target: string, label: string): VerificationCheck {
  const exists = fs.existsSync(repoPath(target));
  return makeCheck(
    'Security Hardening',
    label,
    exists ? 'PASS' : 'FAIL',
    exists ? 'Required V31 module is present.' : 'Required V31 module is missing.',
    target,
  );
}

async function verifyLogin(baseUrl: string, label: string, emailEnv: string, passwordEnv: string): Promise<LoginEvidence> {
  const email = process.env[emailEnv];
  const password = process.env[passwordEnv];
  if (!email || !password) {
    return {
      userLabel: label,
      emailPresent: Boolean(email),
      passwordPresent: Boolean(password),
      loginStatus: 'SKIPPED',
      meStatus: 'SKIPPED',
      detail: `Missing ${emailEnv} or ${passwordEnv}`,
    };
  }

  const fetchFn = (globalThis as any).fetch;
  if (!fetchFn) {
    return {
      userLabel: label,
      emailPresent: true,
      passwordPresent: true,
      loginStatus: 'WARN',
      meStatus: 'SKIPPED',
      detail: 'Global fetch is unavailable in this runtime.',
    };
  }

  try {
    const loginRes = await fetchFn(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      return {
        userLabel: label,
        emailPresent: true,
        passwordPresent: true,
        loginStatus: 'FAIL',
        meStatus: 'SKIPPED',
        detail: `Login failed with status ${loginRes.status}`,
      };
    }

    const loginJson = await loginRes.json();
    const token = loginJson?.token;
    if (!token) {
      return {
        userLabel: label,
        emailPresent: true,
        passwordPresent: true,
        loginStatus: 'FAIL',
        meStatus: 'FAIL',
        detail: 'Login succeeded but token was missing from response.',
      };
    }

    const meRes = await fetchFn(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      userLabel: label,
      emailPresent: true,
      passwordPresent: true,
      loginStatus: 'PASS',
      meStatus: meRes.ok ? 'PASS' : 'FAIL',
      detail: meRes.ok ? 'Login and auth persistence validated.' : `Login ok, /auth/me failed with ${meRes.status}`,
    };
  } catch (error: any) {
    return {
      userLabel: label,
      emailPresent: true,
      passwordPresent: true,
      loginStatus: 'WARN',
      meStatus: 'SKIPPED',
      detail: error?.message || 'Unexpected login verification error.',
    };
  }
}

function buildMarkdown(bundle: SecurityProofBundle): string {
  const lines: string[] = [];
  lines.push('# Security Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  lines.push('| Status | Check | Message | Detail |');
  lines.push('| --- | --- | --- | --- |');
  for (const check of bundle.checks) {
    lines.push(`| ${check.status} | ${check.name} | ${check.message.replace(/\|/g, '\\|')} | ${(check.detail || '').replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  lines.push('## Auth Reliability');
  lines.push('');
  lines.push('| User | Login | Me | Detail |');
  lines.push('| --- | --- | --- | --- |');
  for (const item of bundle.authReliability) {
    lines.push(`| ${item.userLabel} | ${item.loginStatus} | ${item.meStatus} | ${item.detail.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export async function runSecurityVerification(): Promise<SecurityProofBundle> {
  if (!fs.existsSync(PROOF_ROOT)) {
    fs.mkdirSync(PROOF_ROOT, { recursive: true });
  }

  const checks: VerificationCheck[] = [
    fileCheck('apps/api/src/security/uploadGovernanceEngine.ts', 'Upload governance engine exists'),
    fileCheck('apps/api/src/security/exportGovernanceEngine.ts', 'Export governance engine exists'),
    fileCheck('apps/api/src/session/tokenIntegrityValidator.ts', 'Token integrity validator exists'),
    fileCheck('apps/api/src/abuse/bruteForceDefense.ts', 'Brute force defense exists'),
    fileCheck('apps/api/src/monitoring/securityOperationsEngine.ts', 'Security operations engine exists'),
    fileCheck('apps/api/src/governance/governanceComplianceMonitor.ts', 'Governance compliance monitor exists'),
    fileCheck('apps/web/src/components/security/SecurityAuditCard.tsx', 'Security audit card exists'),
    fileCheck('apps/web/src/components/security/UploadGovernanceCard.tsx', 'Upload governance card exists'),
  ];

  const authRoutePath = repoPath('apps', 'api', 'src', 'routes', 'authRoutes.ts');
  const authContent = fs.existsSync(authRoutePath) ? fs.readFileSync(authRoutePath, 'utf-8') : '';
  checks.push(
    makeCheck(
      'Security Hardening',
      'Session diagnostics route mounted',
      /session-diagnostics/.test(authContent) ? 'PASS' : 'FAIL',
      /session-diagnostics/.test(authContent)
        ? 'Session diagnostics endpoint is present on auth routes.'
        : 'Session diagnostics endpoint is missing from auth routes.',
      'apps/api/src/routes/authRoutes.ts',
    ),
  );

  const baseUrl = process.env.SECURITY_VERIFY_BASE_URL || 'http://localhost:5000/api';
  const authReliability = await Promise.all([
    verifyLogin(baseUrl, 'pilot@', 'SECURITY_VERIFY_PILOT_EMAIL', 'SECURITY_VERIFY_PILOT_PASSWORD'),
    verifyLogin(baseUrl, 'AyhanEkici@', 'SECURITY_VERIFY_AYHAN_EMAIL', 'SECURITY_VERIFY_AYHAN_PASSWORD'),
    verifyLogin(baseUrl, 'Mahir', 'SECURITY_VERIFY_MAHIR_EMAIL', 'SECURITY_VERIFY_MAHIR_PASSWORD'),
  ]);

  for (const item of authReliability) {
    checks.push(
      makeCheck(
        'Auth Reliability',
        `Auth flow ${item.userLabel}`,
        item.loginStatus === 'PASS' && item.meStatus === 'PASS' ? 'PASS' : item.loginStatus,
        item.detail,
      ),
    );
  }

  const bundle: SecurityProofBundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: overallStatus(checks),
    checks,
    authReliability,
  };

  fs.writeFileSync(path.join(PROOF_ROOT, 'security-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(path.join(PROOF_ROOT, 'security-proof-bundle.md'), buildMarkdown(bundle), 'utf-8');

  return bundle;
}

export async function runSecurityVerificationCli(): Promise<void> {
  const bundle = await runSecurityVerification();
  process.stdout.write(
    [
      `security verification: ${bundle.overallStatus}`,
      `checks=${bundle.checks.length}`,
      `proof=${PROOF_ROOT.replace(/\\/g, '/')}`,
    ].join(' | ') + '\n',
  );
}
