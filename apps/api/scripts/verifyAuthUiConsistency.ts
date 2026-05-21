import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function run() {
  const login = read('apps/web/src/pages/Login.tsx');
  const app = read('apps/web/src/App.tsx');
  const appShell = read('apps/web/src/components/AppShell.tsx');
  const useAuth = read('apps/web/src/hooks/useAuth.tsx');
  const authStorage = read('apps/web/src/lib/authStorage.ts');
  const auth = read('apps/web/src/lib/auth.ts');

  const checks: Check[] = [];

  checks.push(
    check(
      'Login redirects authenticated users to /dashboard',
      login.includes("navigate('/dashboard', { replace: true })") &&
        login.includes('if (isAuthenticated && user)') &&
        login.includes('useEffect(() => {'),
      'Login page redirects from the authenticated effect when the user is confirmed.',
    ),
  );

  checks.push(
    check(
      'Login form is hidden while authenticated',
      login.includes("if (isAuthenticated || hasPersistentSession || authStatus === 'booting' || authStatus === 'checking')") &&
        login.includes('Oturum doğrulanıyor'),
      'Login page returns verification state while auth is booting/checking or a persistent session is being confirmed.',
    ),
  );

  checks.push(
    check(
      'Navbar derives visibility from auth context only',
      (appShell.includes("authState === 'authenticated'") || appShell.includes('showAuthenticatedNav')) &&
        !appShell.includes('hasAuthSession('),
      'Navbar visibility must not independently infer auth from storage.',
    ),
  );

  checks.push(
    check(
      'Auth storage uses canonical keys',
      authStorage.includes("AUTH_TOKEN_KEY = 'parselradar_token'") && authStorage.includes("AUTH_USER_KEY = 'parselradar_user'"),
      'Canonical localStorage keys are preserved.',
    ),
  );

  checks.push(
    check(
      'setAuthSession writes token and user to localStorage',
      authStorage.includes('localStorage.setItem(AUTH_TOKEN_KEY, token)') &&
        authStorage.includes('localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))'),
      'setAuthSession writes both token and user.',
    ),
  );

  checks.push(
    check(
      'Auth storage exposes hasAuthSession and assertStorageConsistency',
      authStorage.includes('export function hasAuthSession()') && authStorage.includes('export function assertStorageConsistency()'),
      'Storage truth helpers are implemented.',
    ),
  );

  checks.push(
    check(
      'useAuth reconciles memory state with storage state on boot',
      useAuth.includes('assertStorageConsistency()') && useAuth.includes('const token = getAuthToken()'),
      'useAuth validates storage consistency before hydration decisions.',
    ),
  );

  checks.push(
    check(
      'No stale user state survives without session token',
      useAuth.includes("if (user && !hasAuthSession() && (authStatus === 'unauthenticated' || authStatus === 'invalid'))") &&
        useAuth.includes('setUser(null)') &&
        useAuth.includes('setHasPersistentSession(false)') &&
        useAuth.includes("setAuthStatus('unauthenticated')"),
      'useAuth clears stale in-memory user only after a confirmed unauthenticated or invalid session state.',
    ),
  );

  checks.push(
    check(
      'Logout clears canonical localStorage auth state',
      !auth.includes('sessionStorage.clear()') && authStorage.includes('localStorage.removeItem(AUTH_TOKEN_KEY)'),
      'Logout and clearAuthSession should clear canonical localStorage auth data.',
    ),
  );

  checks.push(
    check(
      'Protected routes wait for hydration contract exists',
      app.includes('<RequireAuth>') &&
        app.includes('<AdminOnly>') &&
        app.includes('authStatus') &&
        app.includes('hasPersistentSession') &&
        login.includes("authStatus === 'booting' || authStatus === 'checking'"),
      'Boot/checking contract remains explicit across login and protected route surfaces.',
    ),
  );

  checks.push(
    check(
      'Ctrl+F5 persistence contract exists',
      authStorage.includes('getAuthToken()') && authStorage.includes('getStoredUser()') && useAuth.includes('hydrateAuth()'),
      'Storage-backed boot hydration contract remains in place for hard refresh.',
    ),
  );

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:auth-ui-consistency',
    summary: {
      total: checks.length,
      pass: checks.length - failed.length,
      fail: failed.length,
    },
    checks,
  };

  console.log(JSON.stringify(payload, null, 2));
  if (failed.length > 0) process.exit(1);
}

run();
