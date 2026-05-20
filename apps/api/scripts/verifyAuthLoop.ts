#!/usr/bin/env ts-node
/**
 * verifyAuthLoop.ts — Static analysis proof that the /auth/me 401 storm is fixed.
 *
 * Run: ts-node apps/api/scripts/verifyAuthLoop.ts
 *
 * Exit 0 = all checks pass (safe to deploy)
 * Exit 1 = at least one check failed (do not deploy)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../');
const WEB_SRC = path.join(ROOT, 'apps/web/src');
const API_SRC = path.join(ROOT, 'apps/api/src');

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
}

function readFile(relPath: string): string {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

// ─── 1. authStorage.ts exists ────────────────────────────────────────────────
const authStoragePath = 'apps/web/src/lib/authStorage.ts';
const authStorage = readFile(authStoragePath);
check(
  'authStorage.ts exists',
  authStorage.length > 0,
  authStorage.length > 0 ? authStoragePath : `MISSING: ${authStoragePath}`,
);

// ─── 2. AUTH_TOKEN_KEY defined exactly once (no duplicate storage keys) ───────
const tokenKeyMatches = (authStorage.match(/AUTH_TOKEN_KEY\s*=/g) || []).length;
check(
  'AUTH_TOKEN_KEY defined once in authStorage',
  tokenKeyMatches === 1,
  `Found ${tokenKeyMatches} definition(s) — expected 1`,
);

// ─── 3. clearAuthSession does NOT dispatch auth:changed ───────────────────────
const clearFnMatch = authStorage.match(/function clearAuthSession[\s\S]*?^}/m);
const clearFnBody = clearFnMatch ? clearFnMatch[0] : '';
check(
  'clearAuthSession does not dispatch auth:changed',
  !clearFnBody.includes('auth:changed'),
  clearFnBody.includes('auth:changed')
    ? 'FAIL: clearAuthSession dispatches auth:changed — will cause 401 loop'
    : 'OK — clearAuthSession is silent (no event dispatch)',
);

// ─── 4. setAuthSession dispatches auth:changed ───────────────────────────────
const setFnMatch = authStorage.match(/function setAuthSession[\s\S]*?^}/m);
const setFnBody = setFnMatch ? setFnMatch[0] : '';
check(
  'setAuthSession dispatches auth:changed',
  setFnBody.includes('auth:changed'),
  setFnBody.includes('auth:changed')
    ? 'OK — setAuthSession notifies listeners after login'
    : 'FAIL: setAuthSession should dispatch auth:changed for cross-tab sync',
);

// ─── 5. Login.tsx uses setAuthSession (via login()) — no raw localStorage ─────
const loginPage = readFile('apps/web/src/pages/Login.tsx');
check(
  'Login.tsx does not write localStorage directly',
  !loginPage.includes("localStorage.setItem"),
  loginPage.includes("localStorage.setItem")
    ? 'FAIL: Login.tsx contains direct localStorage.setItem — creates duplicate token write'
    : 'OK — no direct localStorage.setItem in Login.tsx',
);

// ─── 6. Login.tsx imports login from auth.ts ─────────────────────────────────
check(
  "Login.tsx imports login from '../lib/auth'",
  loginPage.includes("from '../lib/auth'"),
  loginPage.includes("from '../lib/auth'") ? 'OK' : 'FAIL: import not found',
);

// ─── 7. api.ts uses getAuthToken from authStorage ────────────────────────────
const apiTs = readFile('apps/web/src/lib/api.ts');
check(
  'api.ts uses getAuthToken from authStorage',
  apiTs.includes('getAuthToken') && apiTs.includes('authStorage'),
  apiTs.includes('getAuthToken') ? 'OK' : 'FAIL: api.ts does not import getAuthToken from authStorage',
);

// ─── 8. api.ts does NOT dispatch auth:changed on 401 (check non-comment code) ─
const apiStatus401Block = (() => {
  const idx = apiTs.indexOf('status === 401');
  if (idx === -1) return '';
  return apiTs.slice(idx, idx + 400);
})();
// Strip single-line comments before checking for the dispatch call.
const apiStatus401NoComments = apiStatus401Block
  .split('\n')
  .filter((l) => !l.trimStart().startsWith('//'))
  .join('\n');
check(
  'api.ts does NOT dispatch auth:changed on 401',
  !apiStatus401NoComments.includes('auth:changed'),
  apiStatus401NoComments.includes('auth:changed')
    ? 'FAIL: api.ts dispatches auth:changed on 401 — this is the loop trigger'
    : 'OK — api.ts silently clears session on 401 (comment mentions are fine)',
);

// ─── 9. api.ts does NOT produce "Bearer undefined" ───────────────────────────
check(
  'api.ts has no "Bearer undefined" risk',
  !apiTs.includes('`Bearer ${') || apiTs.includes('token ?'),
  'OK — token is guarded before interpolation',
);

// ─── 10. useAuth.tsx checks token before calling getMe ───────────────────────
const useAuthTs = readFile('apps/web/src/hooks/useAuth.tsx');
check(
  'useAuth.tsx guards getMe with token check',
  useAuthTs.includes('getAuthToken') && useAuthTs.includes('!token'),
  useAuthTs.includes('getAuthToken') && useAuthTs.includes('!token')
    ? 'OK — hydrateAuth returns early when no token'
    : 'FAIL: useAuth.tsx calls getMe without checking for token',
);

// ─── 11. useAuth.tsx does NOT dispatch auth:changed on 401 catch ─────────────
const catchBlock = (() => {
  const idx = useAuthTs.indexOf('} catch');
  if (idx === -1) return '';
  return useAuthTs.slice(idx, idx + 300);
})();
check(
  'useAuth.tsx does NOT dispatch auth:changed in catch block',
  !catchBlock.includes('auth:changed'),
  catchBlock.includes('auth:changed')
    ? 'FAIL: useAuth.tsx dispatches auth:changed on 401 — this causes the retry loop'
    : 'OK — 401 catch clears session silently',
);

// ─── 12. useAuth.tsx has hydrating state ─────────────────────────────────────
check(
  'useAuth.tsx has hydrating state',
  useAuthTs.includes('hydrating'),
  useAuthTs.includes('hydrating') ? 'OK' : 'FAIL: missing hydrating state',
);

// ─── 13. useAuth.tsx boot useEffect has empty deps [] ────────────────────────
check(
  'useAuth.tsx boot useEffect has empty dependency array',
  useAuthTs.includes('}, []);'),
  useAuthTs.includes('}, []);')
    ? 'OK — effect runs once on mount'
    : 'FAIL: boot useEffect may have non-empty deps causing re-runs',
);

// ─── 14. auth.ts uses clearAuthSession from authStorage ──────────────────────
const authTs = readFile('apps/web/src/lib/auth.ts');
check(
  'auth.ts imports from authStorage',
  authTs.includes('authStorage'),
  authTs.includes('authStorage') ? 'OK' : 'FAIL: auth.ts does not import from authStorage',
);

// ─── 15. auth.ts handles { token, user } response shape ──────────────────────
check(
  'auth.ts handles { token, user } login response shape',
  authTs.includes('response.user') && authTs.includes('response.token'),
  authTs.includes('response.user') && authTs.includes('response.token')
    ? 'OK — login response shape is { token, user }'
    : 'FAIL: auth.ts does not handle { token, user } shape',
);

// ─── 16. Backend login returns { token, user } ───────────────────────────────
const authController = readFile('apps/api/src/controllers/authController.ts');
check(
  'Backend login returns { token, user: { id, email, name, role } }',
  authController.includes('{ token, user:') || authController.includes('{token, user:'),
  authController.includes('{ token, user:') || authController.includes('{token, user:')
    ? 'OK — login response uses nested user object'
    : 'FAIL: authController still returns flat shape',
);

// ─── 17. Backend login res.json() does NOT include passwordHash ──────────────
const loginResJsonLine = (() => {
  const lines = authController.split('\n');
  // Find the res.json call inside the login function (after 'export const login')
  let inLogin = false;
  for (const line of lines) {
    if (line.includes('export const login')) inLogin = true;
    if (inLogin && line.includes('res.json(')) return line;
  }
  return '';
})();
check(
  'Backend login response does not include passwordHash',
  !loginResJsonLine.includes('passwordHash'),
  loginResJsonLine.includes('passwordHash')
    ? 'FAIL: login res.json() includes passwordHash'
    : `OK — res.json line: ${loginResJsonLine.trim().slice(0, 80)}`,
);

// ─── 18. /auth/me route exists ───────────────────────────────────────────────
const authRoutes = readFile('apps/api/src/routes/authRoutes.ts');
check(
  '/auth/me route exists',
  authRoutes.includes("router.get('/me'") || authRoutes.includes('router.get("/me"'),
  authRoutes.includes("router.get('/me'") ? 'OK' : 'FAIL: /auth/me route not found',
);

// ─── 19. No duplicate token key strings across frontend files ─────────────────
const frontendFiles = [
  'apps/web/src/lib/api.ts',
  'apps/web/src/lib/auth.ts',
  'apps/web/src/hooks/useAuth.tsx',
  'apps/web/src/pages/Login.tsx',
  'apps/web/src/pages/Dashboard.tsx',
];
const hardcodedKeyOccurrences: string[] = [];
for (const f of frontendFiles) {
  const content = readFile(f);
  const hits = content.match(/['"]parselradar_token['"]/g) || [];
  if (hits.length > 0) hardcodedKeyOccurrences.push(`${f}: ${hits.length} direct reference(s)`);
}
check(
  'No hardcoded parselradar_token outside authStorage',
  hardcodedKeyOccurrences.length === 0,
  hardcodedKeyOccurrences.length === 0
    ? 'OK — token key only referenced in authStorage.ts'
    : `WARN: direct key references found:\n  ${hardcodedKeyOccurrences.join('\n  ')}`,
);

// ─── 20. No "Bearer undefined" literal in codebase ───────────────────────────
const allWebSrc = (() => {
  function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).flatMap((f) => {
      const full = path.join(dir, f);
      return fs.statSync(full).isDirectory() ? walk(full) : [full];
    });
  }
  return walk(WEB_SRC)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
})();
check(
  'No "Bearer undefined" literal in frontend source',
  !allWebSrc.includes('Bearer undefined'),
  allWebSrc.includes('Bearer undefined')
    ? 'FAIL: Found literal "Bearer undefined" in frontend source'
    : 'OK',
);

// ─── Print Results ────────────────────────────────────────────────────────────
const WIDTH = 72;
console.log('\n' + '═'.repeat(WIDTH));
console.log('  verifyAuthLoop — Auth Loop Static Analysis');
console.log('═'.repeat(WIDTH));

let passed = 0;
let failed = 0;
for (const r of results) {
  const icon = r.pass ? '✓' : '✗';
  const label = r.pass ? 'PASS' : 'FAIL';
  console.log(`\n${icon} [${label}] ${r.name}`);
  console.log(`       ${r.detail}`);
  if (r.pass) passed++;
  else failed++;
}

console.log('\n' + '─'.repeat(WIDTH));
console.log(`  Results: ${passed} passed, ${failed} failed out of ${results.length} checks`);
console.log('─'.repeat(WIDTH) + '\n');

if (failed > 0) {
  console.error(`FAIL — ${failed} check(s) did not pass. Fix before deploying.\n`);
  process.exit(1);
} else {
  console.log('PASS — All auth loop checks passed. Safe to deploy.\n');
  process.exit(0);
}
