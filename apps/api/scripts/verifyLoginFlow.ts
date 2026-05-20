import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';

function loadJson(fileName: string): any | null {
  const filePath = path.resolve(process.cwd(), 'proof', fileName);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJsonAndMarkdown(fileName: string, bundle: any, title: string, rows: Array<{ key: string; status: string; detail: string }>) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, `${fileName}.json`), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${row.key} | ${row.status} | ${row.detail} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, `${fileName}.md`), `${lines.join('\n')}\n`, 'utf-8');
}

function routeProof(): { status: Status; detail: string } {
  const routePath = path.resolve(process.cwd(), 'apps/api/src/routes/authRoutes.ts');
  if (!fs.existsSync(routePath)) return { status: 'FAIL', detail: 'authRoutes.ts missing' };
  const content = fs.readFileSync(routePath, 'utf-8');
  const hasLogin = /router\.post\(\s*['"`]\/login['"`]/.test(content);
  const hasMe = /router\.get\(\s*['"`]\/me['"`]/.test(content);
  return hasLogin && hasMe
    ? { status: 'PASS', detail: 'Login and me routes are mounted.' }
    : { status: 'FAIL', detail: 'Login or me route missing.' };
}

function frontendProof(): { status: Status; detail: string } {
  const useAuthPath = path.resolve(process.cwd(), 'apps/web/src/hooks/useAuth.tsx');
  const authPath = path.resolve(process.cwd(), 'apps/web/src/lib/auth.ts');
  const apiPath = path.resolve(process.cwd(), 'apps/web/src/lib/api.ts');

  if (!fs.existsSync(useAuthPath) || !fs.existsSync(authPath) || !fs.existsSync(apiPath)) {
    return { status: 'FAIL', detail: 'Missing frontend auth files.' };
  }

  const useAuth = fs.readFileSync(useAuthPath, 'utf-8');
  const authLib = fs.readFileSync(authPath, 'utf-8');
  const apiLib = fs.readFileSync(apiPath, 'utf-8');

  const pass =
    /deterministicAuthBootstrap\(/.test(useAuth) &&
    /localStorage\.setItem\(TOKEN_KEY/.test(authLib) &&
    /localStorage\.removeItem\(TOKEN_KEY\)/.test(authLib) &&
    /Authorization:\s*`Bearer \$\{token\}`/.test(apiLib) &&
    /localStorage\.removeItem\(TOKEN_KEY\)/.test(apiLib);

  return pass
    ? { status: 'PASS', detail: 'Auth hydration, persistence, stale-token cleanup, and Authorization header injection are present.' }
    : { status: 'FAIL', detail: 'Frontend auth persistence checks failed.' };
}

function buildProof(): { status: Status; detail: string } {
  const apiDist = path.resolve(process.cwd(), 'apps/api/dist/index.js');
  const webDist = path.resolve(process.cwd(), 'apps/web/dist/index.html');
  const pass = fs.existsSync(apiDist) && fs.existsSync(webDist);
  return pass
    ? { status: 'PASS', detail: 'apps/api and apps/web build artifacts exist.' }
    : { status: 'FAIL', detail: 'Build artifacts missing for apps/api or apps/web.' };
}

function statusFrom(value: any): Status {
  const v = String(value || '').toUpperCase();
  if (v === 'PASS') return 'PASS';
  if (v === 'WARN') return 'WARN';
  return 'FAIL';
}

function pickUserProof(diagnose: any, label: string): { status: Status; detail: string } {
  const item = (diagnose?.userDiagnostics || []).find((entry: any) => String(entry?.label || '').toLowerCase() === label.toLowerCase());
  if (!item) return { status: 'FAIL', detail: 'diagnostic record missing' };

  const pass = Boolean(item.exists) && Boolean(item.bcryptMatch) && Boolean(item.tokenIssued) && Boolean(item.tokenVerified);
  if (pass) return { status: 'PASS', detail: 'exists + bcrypt + jwt + token verification passed' };
  const detail = item.blockedReason || (Array.isArray(item.rootCauseHints) ? item.rootCauseHints.join(', ') : 'login verification failed');
  return { status: 'FAIL', detail: detail || 'login verification failed' };
}

function run() {
  const diagnose = loadJson('auth-diagnose-bundle.json');
  const passwords = loadJson('password-compatibility-proof.json');
  const repair = loadJson('auth-repair-run-proof.json');
  const rbac = loadJson('rbac-proof-bundle.json');
  const platform = loadJson('platform-proof-bundle.json');

  const route = routeProof();
  const frontend = frontendProof();
  const build = buildProof();

  const mongoUserExistenceProof = {
    status: statusFrom(diagnose?.proofs?.mongoUserExistenceProof?.status),
    detail: diagnose?.proofs?.mongoUserExistenceProof?.detail || 'auth-diagnose bundle missing',
  };
  const bcryptCompatibilityProof = {
    status: statusFrom(passwords?.proofs?.bcryptCompatibilityProof?.status),
    detail: passwords?.proofs?.bcryptCompatibilityProof?.detail || 'password-compatibility-proof missing',
  };
  const hashIntegrityProof = {
    status: statusFrom(passwords?.proofs?.hashIntegrityProof?.status),
    detail: passwords?.proofs?.hashIntegrityProof?.detail || 'password-compatibility-proof missing',
  };

  const jwtIssuanceProof = {
    status: statusFrom(diagnose?.proofs?.jwtIssuanceProof?.status),
    detail: diagnose?.proofs?.jwtIssuanceProof?.detail || 'auth-diagnose bundle missing',
  };
  const tokenVerificationProof = {
    status: statusFrom(diagnose?.proofs?.tokenVerificationProof?.status),
    detail: diagnose?.proofs?.tokenVerificationProof?.detail || 'auth-diagnose bundle missing',
  };
  const roleHydrationProof = {
    status: statusFrom(diagnose?.proofs?.roleHydrationProof?.status),
    detail: diagnose?.proofs?.roleHydrationProof?.detail || 'auth-diagnose bundle missing',
  };

  const pilotLoginProof = pickUserProof(diagnose, 'pilot');
  const ayhanLoginProof = pickUserProof(diagnose, 'AyhanEkici');
  const mahirLoginProof = pickUserProof(diagnose, 'Mahir');

  const mahirIsolationProof = {
    status: statusFrom(rbac?.overallStatus),
    detail: statusFrom(rbac?.overallStatus) === 'PASS' ? 'RBAC verifier confirms Mahir isolation controls.' : 'RBAC verifier not PASS.',
  };
  const adminVisibilityProof = {
    status: statusFrom(rbac?.overallStatus),
    detail: statusFrom(rbac?.overallStatus) === 'PASS' ? 'RBAC verifier confirms admin-only visibility.' : 'RBAC verifier not PASS.',
  };

  const repairedUserProof = {
    status: statusFrom(repair?.proofs?.repairedUserProof?.status),
    detail: repair?.proofs?.repairedUserProof?.detail || 'auth-repair-run-proof missing',
  };
  const noOwnershipCorruptionProof = {
    status: statusFrom(repair?.proofs?.noOwnershipCorruptionProof?.status),
    detail: repair?.proofs?.noOwnershipCorruptionProof?.detail || 'auth-repair-run-proof missing',
  };

  const rootCauseProof = {
    status: statusFrom(diagnose?.proofs?.rootCauseProof?.status),
    detail: diagnose?.proofs?.rootCauseProof?.detail || 'auth-diagnose bundle missing',
  };

  const verifyStatus: Status = [
    route.status,
    mongoUserExistenceProof.status,
    bcryptCompatibilityProof.status,
    hashIntegrityProof.status,
    jwtIssuanceProof.status,
    tokenVerificationProof.status,
    frontend.status,
    roleHydrationProof.status,
    pilotLoginProof.status,
    ayhanLoginProof.status,
    mahirLoginProof.status,
    mahirIsolationProof.status,
    adminVisibilityProof.status,
    repairedUserProof.status,
    noOwnershipCorruptionProof.status,
    build.status,
  ].every((s) => s === 'PASS') && statusFrom(platform?.overallStatus) !== 'FAIL'
    ? 'PASS'
    : 'FAIL';

  const loginBundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: verifyStatus,
    proofs: {
      loginRouteProof: route,
      mongoUserExistenceProof,
      bcryptVerificationProof: bcryptCompatibilityProof,
      jwtIssuanceProof,
      tokenVerificationProof,
      frontendAuthPersistenceProof: frontend,
      roleHydrationProof,
      pilotLoginProof,
      ayhanLoginProof,
      mahirLoginProof,
      mahirIsolationProof,
      adminVisibilityProof,
      rootCauseProof,
      buildProof: build,
      verifyProof: {
        status: verifyStatus,
        detail: `platform=${statusFrom(platform?.overallStatus)}, rbac=${statusFrom(rbac?.overallStatus)}, diagnose=${statusFrom(diagnose?.overallStatus)}`,
      },
      repairProof: repairedUserProof,
    },
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
  };

  const authRepairBundle = {
    generatedAt: loginBundle.generatedAt,
    overallStatus: verifyStatus,
    proofs: {
      bcryptCompatibilityProof,
      hashIntegrityProof,
      repairedUserProof,
      jwtIssuanceProof,
      tokenVerificationProof,
      pilotLoginProof,
      ayhanLoginProof,
      mahirLoginProof,
      frontendPersistenceProof: frontend,
      roleHydrationProof,
      adminVisibilityProof,
      mahirIsolationProof,
      noOwnershipCorruptionProof,
      buildProof: build,
      verifyProof: loginBundle.proofs.verifyProof,
      rootCauseProof,
    },
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
  };

  writeJsonAndMarkdown(
    'login-proof-bundle',
    loginBundle,
    'Login Proof Bundle',
    Object.entries(loginBundle.proofs).map(([key, value]: [string, any]) => ({ key, status: value.status || 'N/A', detail: value.detail || '' })),
  );

  writeJsonAndMarkdown(
    'auth-repair-proof-bundle',
    authRepairBundle,
    'Auth Repair Proof Bundle',
    Object.entries(authRepairBundle.proofs).map(([key, value]: [string, any]) => ({ key, status: value.status || 'N/A', detail: value.detail || '' })),
  );

  process.stdout.write(`${JSON.stringify({ overallStatus: verifyStatus, proofPath: 'proof/auth-repair-proof-bundle.json' })}\n`);
  if (verifyStatus !== 'PASS') process.exit(1);
}

try {
  run();
} catch (error: any) {
  const fallback = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    proofs: {
      bcryptCompatibilityProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      hashIntegrityProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      repairedUserProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      jwtIssuanceProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      tokenVerificationProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      pilotLoginProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      ayhanLoginProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      mahirLoginProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      frontendPersistenceProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      roleHydrationProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      adminVisibilityProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      mahirIsolationProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      noOwnershipCorruptionProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      buildProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      verifyProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
      rootCauseProof: { status: 'FAIL', detail: error?.message || 'verify_login_failed' },
    },
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    blockedReason: error?.message || 'verify_login_failed',
  };

  writeJsonAndMarkdown(
    'auth-repair-proof-bundle',
    fallback,
    'Auth Repair Proof Bundle',
    Object.entries(fallback.proofs).map(([key, value]: [string, any]) => ({ key, status: value.status || 'N/A', detail: value.detail || '' })),
  );
  writeJsonAndMarkdown(
    'login-proof-bundle',
    fallback,
    'Login Proof Bundle',
    Object.entries(fallback.proofs).map(([key, value]: [string, any]) => ({ key, status: value.status || 'N/A', detail: value.detail || '' })),
  );

  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'verify_login_failed' })}\n`);
  process.exit(1);
}
