import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BASE_URL = 'https://parselradar-production.up.railway.app';
const LOGIN_URL = `${BASE_URL}/auth/login`;
const ME_URL = `${BASE_URL}/auth/me`;
const PROOF_JSON_PATH = path.join(ROOT, 'proof', 'canonical-auth-validation.json');
const PROOF_MD_PATH = path.join(ROOT, 'proof', 'canonical-auth-validation.md');
const PASSWORD_CHANGED_AFTER_IAT_LITERAL = 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT';
const DISALLOWED_CODES = [
  PASSWORD_CHANGED_AFTER_IAT_LITERAL,
  'TOKEN_VERIFIED_USER_NOT_FOUND',
  'INVALID_SIGNATURE',
] as const;

type AuthMeRecord = {
  index: number;
  status: number;
  email: string | null;
  role: string | null;
  code: string | null;
};

type ProofBundle = {
  generatedAt: string;
  overallStatus: 'PASS' | 'FAIL';
  code: string;
  freshLoginStatus: number | null;
  tokenPresent: boolean;
  authMeStatuses: number[];
  authMeCodes: string[];
  authMeRecords: AuthMeRecord[];
  allAuthMe200: boolean;
  singletonValidatorProof: {
    pass: boolean;
    detail: string;
    canonicalAuthValidatorExists: boolean;
    authImportsValidateAuthToken: boolean;
    literalOccurrencesOnlyAllowed: boolean;
    comparisonOnlyCanonical: boolean;
    unexpectedLiteralPaths: string[];
    comparisonPaths: string[];
  };
  noCookieFallbackProof: {
    pass: boolean;
    detail: string;
  };
  noSyntheticJwtProof: {
    pass: boolean;
    detail: string;
  };
  remainingBlockers: string[];
};

function normalizePath(absolutePath: string): string {
  return path.relative(ROOT, absolutePath).replace(/\\/g, '/');
}

function listFilesRecursively(dirPath: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      results.push(...listFilesRecursively(fullPath));
      continue;
    }
    results.push(fullPath);
  }

  return results;
}

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function writeProof(proof: ProofBundle): void {
  const mdLines = [
    '# Canonical Auth Validation',
    '',
    `overallStatus: ${proof.overallStatus}`,
    `code: ${proof.code}`,
    `freshLoginStatus: ${proof.freshLoginStatus ?? 'null'}`,
    `tokenPresent: ${proof.tokenPresent}`,
    `authMeStatuses: ${proof.authMeStatuses.join(', ') || 'none'}`,
    `authMeCodes: ${proof.authMeCodes.join(', ') || 'none'}`,
    `allAuthMe200: ${proof.allAuthMe200}`,
    `singletonValidatorProof: ${proof.singletonValidatorProof.pass}`,
    `noCookieFallbackProof: ${proof.noCookieFallbackProof.pass}`,
    `noSyntheticJwtProof: ${proof.noSyntheticJwtProof.pass}`,
    `remainingBlockers: ${proof.remainingBlockers.join(' | ') || 'none'}`,
    '',
  ];

  fs.writeFileSync(PROOF_JSON_PATH, `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
  fs.writeFileSync(PROOF_MD_PATH, `${mdLines.join('\n')}\n`, 'utf8');
}

function finalizeAndExit(proof: ProofBundle, exitCode: number): never {
  writeProof(proof);
  console.log(JSON.stringify(proof, null, 2));
  process.exit(exitCode);
}

function buildSourceChecks(): ProofBundle['singletonValidatorProof'] {
  const canonicalPath = 'apps/api/src/session/canonicalAuthValidator.ts';
  const middlewarePath = 'apps/api/src/middleware/auth.ts';
  const canonicalExists = fs.existsSync(path.join(ROOT, canonicalPath));
  const authImportsValidateAuthToken = fs.existsSync(path.join(ROOT, middlewarePath))
    && /import\s*\{[^}]*validateAuthToken[^}]*\}\s*from\s*['"]\.\.\/session\/canonicalAuthValidator['"]/.test(readText(middlewarePath));

  const apiSourceFiles = listFilesRecursively(path.join(ROOT, 'apps', 'api', 'src')).filter((filePath) => filePath.endsWith('.ts') || filePath.endsWith('.tsx'));
  const comparisonPattern = /passwordChangedAtMs\s*>\s*tokenIatMs\s*\+\s*(?:TOKEN_IAT_SKEW_MS|15000)/g;
  const comparisonPaths = apiSourceFiles
    .filter((filePath) => comparisonPattern.test(fs.readFileSync(filePath, 'utf8')))
    .map(normalizePath);

  const repoFiles = listFilesRecursively(ROOT).filter((filePath) => {
    const normalized = normalizePath(filePath);
    if (normalized.startsWith('node_modules/')) return false;
    if (normalized.startsWith('apps/api/dist/')) return false;
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.json') || filePath.endsWith('.md');
  });

  const allowedLiteralPatterns = [
    /^apps\/api\/src\/session\/canonicalAuthValidator\.ts$/,
    /^apps\/api\/scripts\//,
    /^proof\//,
  ];

  const unexpectedLiteralPaths = repoFiles
    .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes(PASSWORD_CHANGED_AFTER_IAT_LITERAL))
    .map(normalizePath)
    .filter((normalized) => !allowedLiteralPatterns.some((pattern) => pattern.test(normalized)));

  const pass = canonicalExists
    && authImportsValidateAuthToken
    && unexpectedLiteralPaths.length === 0
    && comparisonPaths.length === 1
    && comparisonPaths[0] === canonicalPath;

  return {
    pass,
    detail: pass
      ? 'Canonical validator owns the only passwordChangedAt comparison; middleware imports validateAuthToken; no disallowed literal copies found.'
      : 'Source-level singleton validation failed.',
    canonicalAuthValidatorExists: canonicalExists,
    authImportsValidateAuthToken,
    literalOccurrencesOnlyAllowed: unexpectedLiteralPaths.length === 0,
    comparisonOnlyCanonical: comparisonPaths.length === 1 && comparisonPaths[0] === canonicalPath,
    unexpectedLiteralPaths,
    comparisonPaths,
  };
}

function buildBaseProof(): ProofBundle {
  return {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    code: 'UNINITIALIZED',
    freshLoginStatus: null,
    tokenPresent: false,
    authMeStatuses: [],
    authMeCodes: [],
    authMeRecords: [],
    allAuthMe200: false,
    singletonValidatorProof: buildSourceChecks(),
    noCookieFallbackProof: {
      pass: true,
      detail: 'Verifier reads LIVE_VERIFY_PILOT_PASSWORD only and does not inspect cookies.txt, cookies2.txt, or token artifacts.',
    },
    noSyntheticJwtProof: {
      pass: true,
      detail: 'Verifier uses only the token returned by POST /auth/login and never constructs or decodes a substitute JWT for auth decisions.',
    },
    remainingBlockers: [],
  };
}

async function postLogin(password: string): Promise<{ status: number; token: string | null; body: any }> {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ email: 'pilot@test.com', password }),
    redirect: 'manual',
  });

  const body = await response.json().catch(() => null as any);
  return {
    status: response.status,
    token: body?.token ? String(body.token) : null,
    body,
  };
}

async function getMe(token: string, index: number): Promise<AuthMeRecord> {
  const response = await fetch(ME_URL, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
    redirect: 'manual',
  });

  const body = await response.json().catch(() => null as any);
  return {
    index,
    status: response.status,
    email: body?.user?.email ? String(body.user.email) : body?.email ? String(body.email) : null,
    role: body?.user?.role ? String(body.user.role) : body?.role ? String(body.role) : null,
    code: body?.code ? String(body.code) : null,
  };
}

async function main(): Promise<void> {
  const proof = buildBaseProof();

  if (!proof.singletonValidatorProof.pass) {
    proof.code = 'CANONICAL_VALIDATOR_SOURCE_CHECK_FAILED';
    proof.remainingBlockers.push('Source-level singleton validator check failed.');
    finalizeAndExit(proof, 1);
  }

  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) {
    proof.code = 'LIVE_VERIFY_PILOT_PASSWORD_REQUIRED';
    proof.remainingBlockers.push('LIVE_VERIFY_PILOT_PASSWORD is not set.');
    finalizeAndExit(proof, 1);
  }

  const login = await postLogin(password);
  proof.freshLoginStatus = login.status;
  proof.tokenPresent = Boolean(login.token);

  if (login.status !== 200 || !login.token) {
    proof.code = login.status !== 200 ? 'FRESH_LOGIN_FAILED' : 'FRESH_LOGIN_TOKEN_MISSING';
    proof.remainingBlockers.push(`Fresh login did not return a usable token. status=${login.status}`);
    finalizeAndExit(proof, 1);
  }

  for (let index = 1; index <= 10; index += 1) {
    const record = await getMe(login.token, index);
    proof.authMeRecords.push(record);
    proof.authMeStatuses.push(record.status);
    if (record.code) {
      proof.authMeCodes.push(record.code);
    }
  }

  proof.allAuthMe200 = proof.authMeStatuses.length === 10 && proof.authMeStatuses.every((status) => status === 200);

  const disallowedCode = proof.authMeCodes.find((code) => DISALLOWED_CODES.includes(code as (typeof DISALLOWED_CODES)[number]));
  const unauthorizedHit = proof.authMeStatuses.some((status) => status === 401);

  if (!proof.allAuthMe200 || unauthorizedHit || Boolean(disallowedCode)) {
    proof.code = disallowedCode || (unauthorizedHit ? 'AUTH_ME_401' : 'AUTH_ME_NOT_STABLE');
    proof.remainingBlockers.push('Fresh login session was not stable across /auth/me x10.');
    finalizeAndExit(proof, 1);
  }

  proof.overallStatus = 'PASS';
  proof.code = 'CANONICAL_AUTH_VALIDATION_PASS';
  finalizeAndExit(proof, 0);
}

main().catch((error) => {
  const proof = buildBaseProof();
  proof.code = 'CANONICAL_AUTH_VALIDATION_EXCEPTION';
  proof.remainingBlockers.push(error instanceof Error ? error.message : String(error));
  finalizeAndExit(proof, 1);
});
