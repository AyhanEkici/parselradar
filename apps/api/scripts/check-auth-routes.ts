import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';
type Check = { status: Status; detail: string };

const ROOT_DIR = process.cwd();
const SRC_DIR = path.resolve(ROOT_DIR, 'apps/api/src');
const DIST_DIR = path.resolve(ROOT_DIR, 'apps/api/dist');
const PROOF_DIR = path.resolve(ROOT_DIR, 'proof');

function readSource(relPath: string): string {
  const fullPath = path.resolve(SRC_DIR, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

function readDist(relPath: string): string {
  const fullPath = path.resolve(DIST_DIR, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

function checkContains(content: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') return content.includes(pattern);
  return pattern.test(content);
}

function writeProof(bundle: object) {
  if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });
  const jsonPath = path.join(PROOF_DIR, 'auth-route-proof-bundle.json');
  const mdPath = path.join(PROOF_DIR, 'auth-route-proof-bundle.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  const b = bundle as any;
  const lines: string[] = [
    '# Auth Route Proof Bundle',
    '',
    `Generated at: ${b.generatedAt}`,
    `Overall status: ${b.overallStatus}`,
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...Object.entries(b.proofs as Record<string, Check>).map(
      ([k, v]) => `| ${k} | ${v.status} | ${v.detail} |`
    ),
    '',
    '## Commit Hash',
    '',
    `- ${b.commitHash}`,
    '',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf-8');
}

function run() {
  const indexTs = readSource('index.ts');
  const authRoutesTs = readSource('routes/authRoutes.ts');
  const passwordResetRoutesTs = readSource('routes/passwordResetRoutes.ts');
  const passwordResetControllerTs = readSource('controllers/passwordResetController.ts');
  const passwordResetRateLimiterTs = readSource('security/passwordResetRateLimiter.ts');

  const authRoutesJs = readDist('routes/authRoutes.js');
  const passwordResetRoutesJs = readDist('routes/passwordResetRoutes.js');
  const indexJs = readDist('index.js');

  const proofs: Record<string, Check> = {
    // --- Source checks ---
    indexMountsAuthRoutes: {
      status: checkContains(indexTs, "app.use('/auth', authRoutes)") ? 'PASS' : 'FAIL',
      detail: checkContains(indexTs, "app.use('/auth', authRoutes)")
        ? "app.use('/auth', authRoutes) found in index.ts"
        : "app.use('/auth', authRoutes) missing from index.ts",
    },
    authRoutesImportsPasswordReset: {
      status: checkContains(authRoutesTs, 'passwordResetRoutes') ? 'PASS' : 'FAIL',
      detail: checkContains(authRoutesTs, 'passwordResetRoutes')
        ? 'passwordResetRoutes imported in authRoutes.ts'
        : 'passwordResetRoutes import missing from authRoutes.ts',
    },
    authRoutesMountsPasswordReset: {
      status: checkContains(authRoutesTs, "router.use('/', passwordResetRoutes)") ? 'PASS' : 'FAIL',
      detail: checkContains(authRoutesTs, "router.use('/', passwordResetRoutes)")
        ? "router.use('/', passwordResetRoutes) found in authRoutes.ts"
        : "router.use('/', passwordResetRoutes) missing from authRoutes.ts",
    },
    passwordResetRoutesForgotPost: {
      status: checkContains(passwordResetRoutesTs, "router.post('/forgot-password'") ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetRoutesTs, "router.post('/forgot-password'")
        ? "POST /forgot-password registered in passwordResetRoutes.ts"
        : "POST /forgot-password missing from passwordResetRoutes.ts",
    },
    passwordResetRoutesResetPost: {
      status: checkContains(passwordResetRoutesTs, "router.post('/reset-password'") ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetRoutesTs, "router.post('/reset-password'")
        ? "POST /reset-password registered in passwordResetRoutes.ts"
        : "POST /reset-password missing from passwordResetRoutes.ts",
    },
    forgotPasswordControllerExported: {
      status: checkContains(passwordResetControllerTs, 'export async function forgotPassword') ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetControllerTs, 'export async function forgotPassword')
        ? 'forgotPassword exported from passwordResetController.ts'
        : 'forgotPassword not exported from passwordResetController.ts',
    },
    resetPasswordControllerExported: {
      status: checkContains(passwordResetControllerTs, 'export async function resetPassword') ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetControllerTs, 'export async function resetPassword')
        ? 'resetPassword exported from passwordResetController.ts'
        : 'resetPassword not exported from passwordResetController.ts',
    },
    forgotPasswordRateLimiterExists: {
      status: checkContains(passwordResetRateLimiterTs, 'forgotPasswordLimiter') ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetRateLimiterTs, 'forgotPasswordLimiter')
        ? 'forgotPasswordLimiter defined in passwordResetRateLimiter.ts'
        : 'forgotPasswordLimiter missing from passwordResetRateLimiter.ts',
    },
    resetPasswordRateLimiterExists: {
      status: checkContains(passwordResetRateLimiterTs, 'resetPasswordLimiter') ? 'PASS' : 'FAIL',
      detail: checkContains(passwordResetRateLimiterTs, 'resetPasswordLimiter')
        ? 'resetPasswordLimiter defined in passwordResetRateLimiter.ts'
        : 'resetPasswordLimiter missing from passwordResetRateLimiter.ts',
    },
    authRouteMountBeforeJsonFallback: {
      status: (() => {
        const authIdx = indexTs.indexOf("app.use('/auth', authRoutes)");
        const fallbackIdx = indexTs.indexOf("res.status(404).json");
        return authIdx !== -1 && fallbackIdx !== -1 && authIdx < fallbackIdx ? 'PASS' : 'FAIL';
      })(),
      detail: (() => {
        const authIdx = indexTs.indexOf("app.use('/auth', authRoutes)");
        const fallbackIdx = indexTs.indexOf("res.status(404).json");
        if (authIdx === -1) return '/auth route not found in index.ts';
        if (fallbackIdx === -1) return '404 JSON fallback not found in index.ts';
        return authIdx < fallbackIdx
          ? '/auth routes mounted before 404 JSON fallback'
          : '/auth routes mounted AFTER 404 JSON fallback — route will be shadowed';
      })(),
    },
    // --- Compiled dist checks ---
    distAuthRoutesHasPasswordReset: {
      status: checkContains(authRoutesJs, 'passwordResetRoutes') ? 'PASS' : 'FAIL',
      detail: authRoutesJs
        ? checkContains(authRoutesJs, 'passwordResetRoutes')
          ? 'passwordResetRoutes present in compiled dist/routes/authRoutes.js'
          : 'passwordResetRoutes MISSING from compiled dist/routes/authRoutes.js'
        : 'dist/routes/authRoutes.js does not exist — build required',
    },
    distPasswordResetRoutesHasForgot: {
      status: checkContains(passwordResetRoutesJs, 'forgot-password') ? 'PASS' : 'FAIL',
      detail: passwordResetRoutesJs
        ? checkContains(passwordResetRoutesJs, 'forgot-password')
          ? 'forgot-password present in compiled dist/routes/passwordResetRoutes.js'
          : 'forgot-password MISSING from compiled dist/routes/passwordResetRoutes.js'
        : 'dist/routes/passwordResetRoutes.js does not exist — build required',
    },
    distPasswordResetRoutesHasReset: {
      status: checkContains(passwordResetRoutesJs, 'reset-password') ? 'PASS' : 'FAIL',
      detail: passwordResetRoutesJs
        ? checkContains(passwordResetRoutesJs, 'reset-password')
          ? 'reset-password present in compiled dist/routes/passwordResetRoutes.js'
          : 'reset-password MISSING from compiled dist/routes/passwordResetRoutes.js'
        : 'dist/routes/passwordResetRoutes.js does not exist — build required',
    },
    distIndexMountsAuthRoutes: {
      status: checkContains(indexJs, "'/auth'") && checkContains(indexJs, 'authRoutes') ? 'PASS' : 'FAIL',
      detail: checkContains(indexJs, "'/auth'") && checkContains(indexJs, 'authRoutes')
        ? '/auth + authRoutes present in compiled dist/index.js'
        : '/auth mount missing from compiled dist/index.js — rebuild required',
    },
  };

  const overallStatus: Status = Object.values(proofs).every((c) => c.status === 'PASS') ? 'PASS' : 'FAIL';

  // Produce a compact route summary
  const routeSummary = [
    `/auth/register  → POST (authController.register)`,
    `/auth/login     → POST (authController.login)`,
    `/auth/logout    → POST (authController.logout)`,
    `/auth/me        → GET  (authController.getMe) [auth required]`,
    `/auth/forgot-password → POST (passwordResetController.forgotPassword) [rate limited]`,
    `/auth/reset-password  → POST (passwordResetController.resetPassword)  [rate limited]`,
  ];

  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    commitHash: process.env.VERIFY_AUTH_ROUTE_COMMIT_HASH || '',
    routeSummary,
    proofs,
  };

  writeProof(bundle);

  // Pretty print to stdout
  process.stdout.write('\n=== Auth Route Registration Check ===\n');
  for (const [k, v] of Object.entries(proofs)) {
    const icon = v.status === 'PASS' ? '✓' : v.status === 'WARN' ? '⚠' : '✗';
    process.stdout.write(`  ${icon} ${k}: ${v.detail}\n`);
  }
  process.stdout.write('\n');
  process.stdout.write(`Overall: ${overallStatus}\n`);
  process.stdout.write(`Proof:   proof/auth-route-proof-bundle.json\n\n`);

  process.stdout.write(JSON.stringify({ overallStatus, proofPath: 'proof/auth-route-proof-bundle.json' }) + '\n');
  if (overallStatus !== 'PASS') process.exit(1);
}

run();
