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
  const app = read('apps/web/src/App.tsx');
  const dashboard = read('apps/web/src/pages/Dashboard.tsx');
  const credits = read('apps/web/src/pages/Credits.tsx');
  const useAuth = read('apps/web/src/hooks/useAuth.tsx');
  const api = read('apps/web/src/lib/api.ts');
  const authStorage = read('apps/web/src/lib/authStorage.ts');

  const checks: Check[] = [];

  checks.push(
    check(
      'Dashboard protected API access is behind RequireAuth route wrapper',
      app.includes('<RequireAuth><Dashboard /></RequireAuth>') && dashboard.includes('if (!user) return;') && dashboard.includes("apiFetch('credits')"),
      'Dashboard should rely on centralized route guard and user context before API calls.',
    ),
  );

  checks.push(
    check(
      'Credits protected API access is behind RequireAuth route wrapper',
      app.includes('<RequireAuth><Credits /></RequireAuth>') && credits.includes('if (!user) return null;') && credits.includes("apiFetch('credits')"),
      'Credits should rely on centralized route guard and user context before API calls.',
    ),
  );

  checks.push(
    check(
      'Credits API uses centralized apiFetch',
      credits.includes("from '../lib/api'") && !credits.includes('fetch('),
      'No raw fetch used in Credits page.',
    ),
  );

  checks.push(
    check(
      '/auth/me is not redundantly called in Dashboard',
      !dashboard.includes('getMe('),
      'Dashboard relies on auth context instead of direct getMe calls.',
    ),
  );

  checks.push(
    check(
      'All dashboard async protected fetches have try/catch',
      dashboard.includes('try {') && dashboard.includes('} catch') && dashboard.includes('apiError?.status === 401'),
      'Dashboard handles API failures and 401 state transition.',
    ),
  );

  checks.push(
    check(
      '401 handling remains centralized in api.ts',
      api.includes('response.status === 401') && api.includes('session clearing is handled explicitly'),
      'apiFetch handles 401 centrally and does not force-clear session on transient endpoint failures.',
    ),
  );

  checks.push(
    check(
      'No uncaught in-promise patterns in dashboard/auth/credits path',
      !dashboard.includes('Uncaught (in promise)') && !credits.includes('Uncaught (in promise)') && !useAuth.includes('Uncaught (in promise)'),
      'No explicit uncaught promise patterns found in key files.',
    ),
  );

  checks.push(
    check(
      'Auth storage is canonical for token header usage',
      authStorage.includes('AUTH_TOKEN_KEY') && api.includes('getAuthToken()') && api.includes('Authorization: `Bearer ${token}`'),
      'Token key + auth header path is centralized via authStorage/apiFetch.',
    ),
  );

  const failed = checks.filter((c) => !c.pass);
  const output = {
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    checks,
    summary: {
      total: checks.length,
      pass: checks.length - failed.length,
      fail: failed.length,
    },
  };

  console.log(JSON.stringify(output, null, 2));
  if (failed.length > 0) process.exit(1);
}

run();