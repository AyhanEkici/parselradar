import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';

type Check = { status: Status; detail: string };

const REQUIRED_ORIGINS = [
  'https://parselradar.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

const TARGET_CANDIDATES = [
  String(process.env.CORS_VERIFY_TARGET || '').trim(),
  String(process.env.API_URL || '').trim(),
  String(process.env.RAILWAY_API_URL || '').trim(),
  'https://parselradar-production.up.railway.app',
  'https://api.parselradar.com',
].filter(Boolean);

function toStatus(value: unknown): Status {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'PASS') return 'PASS';
  if (normalized === 'WARN') return 'WARN';
  return 'FAIL';
}

function loadJson(fileName: string): any | null {
  const filePath = path.resolve(process.cwd(), 'proof', fileName);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'cors-auth-recovery-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# CORS Auth Recovery Proof Bundle');
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
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'cors-auth-recovery-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

function checkStaticConfig(indexContent: string): {
  corsConfigProof: Check;
  allowedOriginsProof: Check;
  optionsPreflightProof: Check;
  accessControlAllowOriginProof: Check;
  credentialsProof: Check;
} {
  const missingOrigins = REQUIRED_ORIGINS.filter((origin) => !indexContent.includes(origin));
  const allowedOriginsProof: Check = missingOrigins.length === 0
    ? { status: 'PASS', detail: 'All required origins are explicitly whitelisted in API CORS config.' }
    : { status: 'FAIL', detail: `Missing required origins in API config: ${missingOrigins.join(', ')}` };

  const hasCorsMiddleware = /app\.use\(\s*cors\(/.test(indexContent);
  const hasOptionsHandler = /app\.options\(\s*['"`]\*['"`]/.test(indexContent) && /optionsSuccessStatus\s*:\s*204/.test(indexContent);
  const hasCredentials = /credentials\s*:\s*true/.test(indexContent);
  const hasAllowedHeaders = /allowedHeaders\s*:\s*\['Content-Type', 'Authorization', 'X-Request-Id'\]/.test(indexContent);
  const hasMethods = /methods\s*:\s*\['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'\]/.test(indexContent);
  const hasOriginAllowLogic = /isOriginAllowed\(/.test(indexContent);

  return {
    corsConfigProof: hasCorsMiddleware && hasOriginAllowLogic
      ? { status: 'PASS', detail: 'CORS middleware uses explicit allow-logic and origin callback.' }
      : { status: 'FAIL', detail: 'CORS middleware or origin allow-logic missing.' },
    allowedOriginsProof,
    optionsPreflightProof: hasOptionsHandler
      ? { status: 'PASS', detail: 'OPTIONS wildcard preflight handler with 204 success status is configured.' }
      : { status: 'FAIL', detail: 'OPTIONS preflight wildcard handler missing or incomplete.' },
    accessControlAllowOriginProof: hasAllowedHeaders && hasMethods
      ? { status: 'PASS', detail: 'CORS headers/methods config set for preflight and request flow.' }
      : { status: 'FAIL', detail: 'CORS allowed headers/methods config incomplete.' },
    credentialsProof: hasCredentials
      ? { status: 'PASS', detail: 'credentials:true is enabled in CORS configuration.' }
      : { status: 'FAIL', detail: 'credentials:true missing from CORS configuration.' },
  };
}

async function probePreflight(targetBaseUrl: string, origin: string): Promise<Check> {
  const probePath = String(process.env.CORS_VERIFY_PATH || '/health').trim() || '/health';
  const normalizedPath = probePath.startsWith('/') ? probePath : `/${probePath}`;
  const target = `${targetBaseUrl.replace(/\/+$/, '')}${normalizedPath}`;
  try {
    const response = await fetch(target, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');
    const statusOk = response.status === 200 || response.status === 204;
    const originOk = allowOrigin === origin || allowOrigin === '*';
    const credentialsOk = String(allowCredentials || '').toLowerCase() === 'true';

    if (statusOk && originOk && credentialsOk) {
      return { status: 'PASS', detail: `Preflight succeeded for ${origin} with ACAO and credentials headers.` };
    }

    return {
      status: 'FAIL',
      detail: `Preflight for ${origin} status=${response.status}, acao=${allowOrigin || 'none'}, acc=${allowCredentials || 'none'}`,
    };
  } catch (error: any) {
    return { status: 'WARN', detail: `Live preflight probe failed for ${origin}: ${error?.message || 'network_error'}` };
  }
}

async function probeHealth(targetBaseUrl: string): Promise<Check> {
  const target = `${targetBaseUrl.replace(/\/+$/, '')}/health`;
  try {
    const response = await fetch(target, { method: 'GET' });
    const body = await response.text();
    if (response.ok && body) {
      return { status: 'PASS', detail: `Health probe succeeded for ${targetBaseUrl}.` };
    }
    return { status: 'FAIL', detail: `Health probe returned status=${response.status} for ${targetBaseUrl}.` };
  } catch (error: any) {
    return { status: 'WARN', detail: `Health probe failed for ${targetBaseUrl}: ${error?.message || 'network_error'}` };
  }
}

async function resolveActiveApiTarget() {
  for (const candidate of TARGET_CANDIDATES) {
    const health = await probeHealth(candidate);
    if (health.status === 'PASS') {
      return { target: candidate, health };
    }
  }

  return { target: TARGET_CANDIDATES[0] || '', health: { status: 'FAIL' as const, detail: 'No active API target responded to /health.' } };
}

async function run() {
  const indexPath = path.resolve(process.cwd(), 'apps/api/src/index.ts');
  const indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : '';

  const staticChecks = checkStaticConfig(indexContent);
  const activeTarget = await resolveActiveApiTarget();
  const targetBaseUrl = activeTarget.target;

  const vercelPreflight = await probePreflight(targetBaseUrl, 'https://parselradar.vercel.app');
  const localPreflight = await probePreflight(targetBaseUrl, 'http://localhost:5173');
  const railwayPreflight = await probePreflight(targetBaseUrl, targetBaseUrl);

  const loginProof = loadJson('login-proof-bundle.json');
  const rbacProof = loadJson('rbac-proof-bundle.json');

  const jwtIssuanceProof: Check = {
    status: loginProof?.proofs?.jwtIssuanceProof?.status
      ? toStatus(loginProof?.proofs?.jwtIssuanceProof?.status)
      : 'WARN',
    detail: loginProof?.proofs?.jwtIssuanceProof?.detail || 'login proof missing (not CORS-critical)',
  };
  const sessionPersistenceProof: Check = {
    status: toStatus(loginProof?.proofs?.frontendAuthPersistenceProof?.status),
    detail: loginProof?.proofs?.frontendAuthPersistenceProof?.detail || 'login proof missing',
  };
  const mahirIsolationProof: Check = {
    status: toStatus(loginProof?.proofs?.mahirIsolationProof?.status || rbacProof?.overallStatus),
    detail: loginProof?.proofs?.mahirIsolationProof?.detail || 'RBAC proof used for Mahir isolation continuity.',
  };
  const adminVisibilityProof: Check = {
    status: toStatus(loginProof?.proofs?.adminVisibilityProof?.status || rbacProof?.overallStatus),
    detail: loginProof?.proofs?.adminVisibilityProof?.detail || 'RBAC proof used for admin visibility continuity.',
  };

  const knownResetProof = loadJson('known-user-reset-proof-bundle.json');
  const noPasswordResetProof: Check = {
    status: knownResetProof?.results?.length
      ? toStatus(knownResetProof.results.some((item: any) => item.updated === true) ? 'FAIL' : 'PASS')
      : 'PASS',
    detail: knownResetProof?.results?.length
      ? knownResetProof.results.some((item: any) => item.updated === true)
        ? 'Detected password reset activity in known-user reset workflow.'
        : 'No password reset updates were executed in known-user reset workflow.'
      : 'No known-user reset run detected in current proof set.',
  };

  const proofs = {
    activeApiTargetProof: {
      status: targetBaseUrl ? 'PASS' : 'FAIL',
      detail: targetBaseUrl
        ? `Resolved active API target: ${targetBaseUrl}`
        : 'No active API target resolved.',
    },
    targetReachabilityProof: activeTarget.health,
    resolvedApiTargetProof: {
      status: targetBaseUrl ? 'PASS' : 'FAIL',
      detail: targetBaseUrl ? `Resolved active API target: ${targetBaseUrl}` : 'No active API target resolved.',
    },
    corsConfigProof: staticChecks.corsConfigProof,
    allowedOriginsProof: staticChecks.allowedOriginsProof,
    optionsPreflightProof: staticChecks.optionsPreflightProof,
    accessControlAllowOriginProof: staticChecks.accessControlAllowOriginProof,
    credentialsTrueProof: staticChecks.credentialsProof,
    vercelLoginProof: vercelPreflight,
    jwtIssuanceProof,
    sessionPersistenceProof,
    mahirIsolationProof,
    adminVisibilityProof,
    noPasswordResetProof,
    localPreflightProof: localPreflight,
    railwayPreflightProof: railwayPreflight,
  };

  const gatingChecks = [
    proofs.corsConfigProof,
    proofs.allowedOriginsProof,
    proofs.optionsPreflightProof,
    proofs.accessControlAllowOriginProof,
    proofs.credentialsTrueProof,
    proofs.vercelLoginProof,
    proofs.localPreflightProof,
    proofs.railwayPreflightProof,
    proofs.sessionPersistenceProof,
    proofs.mahirIsolationProof,
    proofs.adminVisibilityProof,
    proofs.noPasswordResetProof,
  ];
  const overallStatus: Status = gatingChecks.every((value) => value.status === 'PASS') ? 'PASS' : 'FAIL';

  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    activeTarget: targetBaseUrl,
    proofs,
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
  };

  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus, proofPath: 'proof/cors-auth-recovery-proof-bundle.json' })}\n`);
  if (overallStatus !== 'PASS') process.exit(1);
}

run().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    proofs: {
      corsConfigProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      allowedOriginsProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      optionsPreflightProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      accessControlAllowOriginProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      credentialsTrueProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      vercelLoginProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      jwtIssuanceProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      sessionPersistenceProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      mahirIsolationProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      adminVisibilityProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
      noPasswordResetProof: { status: 'FAIL', detail: error?.message || 'verify_cors_failed' },
    },
    commitHash: process.env.VERIFY_LOGIN_COMMIT_HASH || '',
    blockedReason: error?.message || 'verify_cors_failed',
  };
  writeProof(bundle);
  process.stderr.write(`${JSON.stringify({ overallStatus: 'FAIL', error: error?.message || 'verify_cors_failed' })}\n`);
  process.exit(1);
});
