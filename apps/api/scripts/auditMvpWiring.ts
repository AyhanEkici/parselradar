import fs from 'fs';
import path from 'path';

type Role = 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';

type AuditRow = {
  navLabel: string;
  route: string;
  component: string;
  requiredRole: Role;
  backendEndpoints: string[];
  adminExpected: 'YES' | 'NO';
  userExpected: 'YES' | 'NO';
  authHeaderRequired: 'YES' | 'NO';
  currentStatus: 'PASS' | 'FAIL' | 'WARN';
  issue: string;
  fixRequired: string;
};

const ROOT = process.cwd();
const APP_PATH = path.join(ROOT, 'apps/web/src/App.tsx');
const WEB_SRC = path.join(ROOT, 'apps/web/src');
const PROOF_JSON = path.join(ROOT, 'proof/mvp-wiring-audit.json');
const PROOF_MD = path.join(ROOT, 'proof/mvp-wiring-audit.md');

function read(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

function parseTopNav(appText: string): Array<{ label: string; route: string }> {
  const navSectionMatch = appText.match(/<nav className="flex flex-wrap gap-2 text-xs">([\s\S]*?)<\/nav>/m);
  if (!navSectionMatch) return [];
  const section = navSectionMatch[1];
  const out: Array<{ label: string; route: string }> = [];
  const re = /<(?:a href|Link to)="([^"]+)"[^>]*>([^<]+)<\/(?:a|Link)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    out.push({ route: m[1].trim(), label: m[2].trim() });
  }
  return out;
}

function parseRoutes(appText: string): Array<{ route: string; component: string; requiredRole: Role }> {
  const rows: Array<{ route: string; component: string; requiredRole: Role }> = [];
  const re = /<Route\s+path="([^"]+)"\s+element=\{([^}]*)\}\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(appText)) !== null) {
    const route = m[1].trim();
    const expr = m[2];
    const admin = expr.includes('<AdminOnly>');
    let component = 'UNKNOWN';
    if (admin) {
      const wrapped = expr.match(/<AdminOnly>\s*<([A-Z][A-Za-z0-9_]*)/);
      component = wrapped ? wrapped[1] : 'UNKNOWN';
    } else {
      const componentMatch = expr.match(/<([A-Z][A-Za-z0-9_]*)/);
      component = componentMatch ? componentMatch[1] : 'UNKNOWN';
    }

    let requiredRole: Role = 'AUTHENTICATED';
    if (admin) requiredRole = 'ADMIN';
    if (['/login', '/register', '/forgot-password', '/reset-password', '/access-denied'].includes(route)) {
      requiredRole = 'PUBLIC';
    }
    rows.push({ route, component, requiredRole });
  }
  return rows;
}

function componentPath(component: string): string | null {
  if (component === 'NotFound') return 'apps/web/src/pages/NotFound.tsx';
  const candidate = `apps/web/src/pages/${component}.tsx`;
  if (fileExists(candidate)) return candidate;
  return null;
}

function endpointsFromComponent(relPath: string): string[] {
  const text = read(path.join(ROOT, relPath));
  const out = new Set<string>();
  const re = /apiFetch\(\s*['"`]([^'"`]+)['"`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.add(String(m[1]).trim());
  return Array.from(out).sort();
}

function statusForRow(row: AuditRow): { status: 'PASS' | 'FAIL' | 'WARN'; issue: string; fixRequired: string } {
  const issues: string[] = [];
  const fixes: string[] = [];

  if (row.component === 'UNKNOWN') {
    issues.push('Route element component could not be parsed.');
    fixes.push('Use explicit component element for route.');
  }

  const compPath = componentPath(row.component);
  if (!compPath && row.component !== 'Navigate') {
    issues.push('Component file not found.');
    fixes.push('Create missing page component or correct route import.');
  }

  if (row.requiredRole === 'ADMIN' && row.userExpected !== 'NO') {
    issues.push('Admin route should not allow USER.');
    fixes.push('Keep AdminOnly/RoleGate enforcement strict.');
  }

  if (row.requiredRole !== 'PUBLIC' && row.authHeaderRequired !== 'YES') {
    issues.push('Protected route should require auth header-bearing API contract.');
    fixes.push('Ensure page uses apiFetch and auth guard.');
  }

  if (issues.length > 0) {
    return { status: 'FAIL', issue: issues.join(' '), fixRequired: fixes.join(' ') };
  }

  if (row.backendEndpoints.length === 0 && row.requiredRole !== 'PUBLIC') {
    return {
      status: 'WARN',
      issue: 'No explicit apiFetch endpoint detected in component (might be static or child-driven).',
      fixRequired: 'Confirm child components or hooks handle API calls safely.',
    };
  }

  return { status: 'PASS', issue: 'None', fixRequired: 'None' };
}

function markdownTable(rows: AuditRow[]): string {
  const header = [
    '| navLabel | route | component | requiredRole | backendEndpoints | adminExpected | userExpected | authHeaderRequired | currentStatus | issue | fixRequired |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  const body = rows.map((r) => {
    const endpoints = r.backendEndpoints.length > 0 ? r.backendEndpoints.join(', ') : '-';
    return `| ${r.navLabel} | ${r.route} | ${r.component} | ${r.requiredRole} | ${endpoints} | ${r.adminExpected} | ${r.userExpected} | ${r.authHeaderRequired} | ${r.currentStatus} | ${r.issue} | ${r.fixRequired} |`;
  });
  return [...header, ...body].join('\n');
}

function main() {
  const appText = read(APP_PATH);
  const nav = parseTopNav(appText);
  const routes = parseRoutes(appText);

  const navByRoute = new Map<string, string>();
  for (const n of nav) navByRoute.set(n.route, n.label);

  const rows: AuditRow[] = routes.map((r) => {
    const relCompPath = componentPath(r.component);
    const endpoints = relCompPath ? endpointsFromComponent(relCompPath) : [];
    const adminExpected = r.requiredRole === 'PUBLIC' ? 'NO' : 'YES';
    const userExpected = r.requiredRole === 'ADMIN' ? 'NO' : 'YES';
    const authHeaderRequired = r.requiredRole === 'PUBLIC' ? 'NO' : 'YES';
    const row: AuditRow = {
      navLabel: navByRoute.get(r.route) || '-',
      route: r.route,
      component: r.component,
      requiredRole: r.requiredRole,
      backendEndpoints: endpoints,
      adminExpected,
      userExpected,
      authHeaderRequired,
      currentStatus: 'PASS',
      issue: 'None',
      fixRequired: 'None',
    };
    const verdict = statusForRow(row);
    row.currentStatus = verdict.status;
    row.issue = verdict.issue;
    row.fixRequired = verdict.fixRequired;
    return row;
  });

  const orphanNav = nav.filter((n) => !routes.some((r) => r.route === n.route));
  for (const n of orphanNav) {
    rows.push({
      navLabel: n.label,
      route: n.route,
      component: 'MISSING_ROUTE',
      requiredRole: 'PUBLIC',
      backendEndpoints: [],
      adminExpected: 'NO',
      userExpected: 'NO',
      authHeaderRequired: 'NO',
      currentStatus: 'FAIL',
      issue: 'Nav item points to non-existent route.',
      fixRequired: 'Add matching route or remove/fix nav item target.',
    });
  }

  const summary = {
    total: rows.length,
    pass: rows.filter((r) => r.currentStatus === 'PASS').length,
    warn: rows.filter((r) => r.currentStatus === 'WARN').length,
    fail: rows.filter((r) => r.currentStatus === 'FAIL').length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    overallStatus: summary.fail === 0 ? 'PASS' : 'FAIL',
    summary,
    rows,
    notes: [
      'Audit is static wiring + contract inspection (route/nav/component/apiFetch extraction).',
      'Use verify scripts + live checks to validate runtime behavior after fixes.',
    ],
  };

  fs.mkdirSync(path.dirname(PROOF_JSON), { recursive: true });
  fs.writeFileSync(PROOF_JSON, JSON.stringify(report, null, 2));

  const md = [
    '# MVP Wiring Audit',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- overallStatus: ${report.overallStatus}`,
    `- total: ${summary.total}, pass: ${summary.pass}, warn: ${summary.warn}, fail: ${summary.fail}`,
    '',
    markdownTable(rows),
  ].join('\n');
  fs.writeFileSync(PROOF_MD, md);

  console.log(JSON.stringify(report, null, 2));
  if (summary.fail > 0) process.exit(1);
}

main();
