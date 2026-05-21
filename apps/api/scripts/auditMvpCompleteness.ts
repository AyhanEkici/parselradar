import fs from 'fs';
import path from 'path';

type Status =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'PLACEHOLDER'
  | 'MOCK_DATA'
  | 'DISCONNECTED'
  | 'MISSING_BACKEND'
  | 'MISSING_FRONTEND'
  | 'BROKEN_ACTION'
  | 'ROLE_MISMATCH'
  | 'PRODUCTION_BLOCKER';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

type RouteAuditRow = {
  route: string;
  pageComponent: string;
  requiredRole: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';
  visibleNavLabel: string;
  primaryActions: string[];
  backendEndpointsUsed: string[];
  currentStatus: Status;
  issue: string;
  severity: Severity;
  fixRequired: string;
  priority: Priority;
};

type ApiAuditRow = {
  endpoint: string;
  method: string;
  requiredRole: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';
  controller: string;
  frontendConsumers: string[];
  currentStatus: Status;
  issue: string;
  severity: Severity;
  fixRequired: string;
  priority: Priority;
};

type RouteDef = {
  route: string;
  component: string;
  requiredRole: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';
};

type ApiDef = {
  endpoint: string;
  method: string;
  requiredRole: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';
  controller: string;
  sourceFile: string;
};

const ROOT = process.cwd();
const WEB_SRC = path.join(ROOT, 'apps/web/src');
const API_SRC = path.join(ROOT, 'apps/api/src');
const PROOF_DIR = path.join(ROOT, 'proof');

const APP_PATH = path.join(WEB_SRC, 'App.tsx');
const APP_SHELL_PATH = path.join(WEB_SRC, 'components/AppShell.tsx');
const API_INDEX_PATH = path.join(API_SRC, 'index.ts');
const API_ROUTES_DIR = path.join(API_SRC, 'routes');

const KEYWORD_RE = /TODO|FIXME|mock|placeholder|fake|coming soon|not implemented|console\.log/gi;
const MOCK_RE = /\bmock\b|mockData|demo data|hardcoded|stubbed/i;
const PLACEHOLDER_RE = /coming soon|not implemented|todo|fixme|under construction/i;

const SCOPE_ROUTES: Array<{ label: string; route: string }> = [
  { label: 'dashboard', route: '/dashboard' },
  { label: 'credits', route: '/credits' },
  { label: 'reports', route: '/reports' },
  { label: 'analyses', route: '/admin/analyses' },
  { label: 'investor', route: '/investor' },
  { label: 'saved analyses', route: '/investor/saved-analyses' },
  { label: 'watchlist', route: '/investor/watchlist' },
  { label: 'portfolio', route: '/investor/portfolio' },
  { label: 'organizations', route: '/organizations' },
  { label: 'notifications', route: '/notifications' },
  { label: 'admin users', route: '/admin/users' },
  { label: 'admin analyses', route: '/admin/analyses' },
  { label: 'admin credit ledger', route: '/admin/credit-ledger' },
  { label: 'admin stripe sessions', route: '/admin/stripe-sessions' },
  { label: 'admin properties', route: '/admin/properties' },
  { label: 'admin runtime', route: '/admin/runtime' },
  { label: 'admin deployment', route: '/admin/deployment' },
  { label: 'admin observability', route: '/admin/observability' },
  { label: 'admin analytics', route: '/admin/analytics' },
  { label: 'admin connectors', route: '/admin/connectors' },
  { label: 'audit timeline', route: '/admin/audit-timeline' },
];

const REQUIRED_API_GROUPS = [
  '/auth',
  '/admin/users',
  '/credits',
  '/stripe',
  '/analysis',
  '/properties',
  '/organizations',
  '/notifications',
  '/admin/connectors',
  '/admin/audit-events',
  '/health',
  '/__buildinfo',
];

function normalizePath(value: string): string {
  return value
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/\?.*$/, '')
    .replace(/:[A-Za-z0-9_]+/g, ':param')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .replace(/^$/, '/');
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function writeJson(filePath: string, payload: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeMd(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content}\n`, 'utf8');
}

function listFiles(dir: string, ext: string, out: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(abs, ext, out);
    } else if (entry.isFile() && abs.endsWith(ext)) {
      out.push(abs);
    }
  }
  return out;
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function parseRoutes(appText: string): RouteDef[] {
  const rows: RouteDef[] = [];
  const routeRe = /<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = routeRe.exec(appText)) !== null) {
    const route = m[1].trim();
    const expr = m[2];
    const isAdmin = expr.includes('<AdminOnly>');
    const isPublic = ['/login', '/forgot-password', '/reset-password', '/register', '/access-denied', '/'].includes(route);

    const tokens = Array.from(expr.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)).map((x) => x[1]);
    const leaf = [...tokens].reverse().find((token) => token !== 'RequireAuth' && token !== 'AdminOnly');
    const component = leaf || 'UNKNOWN';

    const requiredRole: RouteDef['requiredRole'] = isPublic ? 'PUBLIC' : isAdmin ? 'ADMIN' : 'AUTHENTICATED';
    rows.push({ route, component, requiredRole });
  }
  return rows;
}

function parseNav(shellText: string): Map<string, string> {
  const out = new Map<string, string>();
  const navMatch = shellText.match(/<nav className="flex flex-wrap gap-2 text-xs">([\s\S]*?)<\/nav>/m);
  if (!navMatch) return out;
  const section = navMatch[1];
  const linkRe = /<Link to="([^"]+)"[^>]*>([^<]+)<\/Link>/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(section)) !== null) {
    out.set(m[1].trim(), m[2].trim());
  }
  return out;
}

function pagePath(component: string): string | null {
  if (component === 'UNKNOWN' || component === 'Navigate') return null;
  const candidate = path.join(WEB_SRC, 'pages', `${component}.tsx`);
  if (fs.existsSync(candidate)) return candidate;
  return null;
}

function extractApiFetchCalls(text: string): string[] {
  const calls = new Set<string>();
  const re = /apiFetch\(\s*['"`]([^'"`]+)['"`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    calls.add(m[1].trim());
  }
  return Array.from(calls).sort();
}

function extractActions(text: string): { actions: string[]; unboundButtons: number; formsWithoutSubmit: number } {
  const actions = new Set<string>();
  let unboundButtons = 0;
  let formsWithoutSubmit = 0;

  const buttonRe = /<button([^>]*)>([\s\S]*?)<\/button>/g;
  let b: RegExpExecArray | null;
  while ((b = buttonRe.exec(text)) !== null) {
    const attrs = b[1] || '';
    const label = String(b[2] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (label) actions.add(`button:${label}`);
    const hasOnClick = /onClick\s*=/.test(attrs);
    const isSubmit = /type\s*=\s*"submit"/.test(attrs) || /type\s*=\s*\{'submit'\}/.test(attrs);
    if (!hasOnClick && !isSubmit) unboundButtons += 1;
  }

  const formRe = /<form([^>]*)>/g;
  let f: RegExpExecArray | null;
  while ((f = formRe.exec(text)) !== null) {
    const attrs = f[1] || '';
    if (!/onSubmit\s*=/.test(attrs)) formsWithoutSubmit += 1;
    actions.add('form:present');
  }

  const linkRe = /<Link to="([^"]+)"/g;
  let l: RegExpExecArray | null;
  while ((l = linkRe.exec(text)) !== null) actions.add(`link:${l[1]}`);

  return { actions: Array.from(actions).slice(0, 12), unboundButtons, formsWithoutSubmit };
}

function parseApiMounts(indexText: string): Map<string, string> {
  const importMap = new Map<string, string>();
  const importRe = /import\s+([A-Za-z0-9_]+)\s+from\s+'\.\/routes\/([^']+)'/g;
  let i: RegExpExecArray | null;
  while ((i = importRe.exec(indexText)) !== null) {
    importMap.set(i[1], `${i[2]}.ts`);
  }

  const mounts = new Map<string, string>();
  const mountRe = /app\.use\(\s*'([^']+)'\s*,\s*([A-Za-z0-9_]+)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = mountRe.exec(indexText)) !== null) {
    const mountPath = m[1];
    const varName = m[2];
    const file = importMap.get(varName);
    if (file) mounts.set(file, mountPath);
  }

  // Special-case wrapper mount for stripe routes.
  if (!mounts.has('stripeRoutes.ts') && /app\.use\(\s*'\/stripe'/.test(indexText)) {
    mounts.set('stripeRoutes.ts', '/stripe');
  }

  return mounts;
}

function parseApiRoutes(filePath: string, mountPath: string): ApiDef[] {
  const text = readText(filePath);
  const defs: ApiDef[] = [];
  const routeRe = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,([\s\S]*?)\);/g;
  let m: RegExpExecArray | null;
  while ((m = routeRe.exec(text)) !== null) {
    const method = m[1].toUpperCase();
    const localPath = m[2];
    const tail = m[3].trim();

    const endpoint = `${mountPath === '/' ? '' : mountPath}${localPath}`.replace(/\/\//g, '/');
    const requiredRole: ApiDef['requiredRole'] = /\badmin\b/.test(tail)
      ? 'ADMIN'
      : /\bauth\b/.test(tail)
      ? 'AUTHENTICATED'
      : 'PUBLIC';

    const parts = tail.split(',').map((s) => s.trim()).filter(Boolean);
    const controller = parts.length > 0 ? parts[parts.length - 1] : 'UNKNOWN_HANDLER';

    defs.push({
      endpoint,
      method,
      requiredRole,
      controller,
      sourceFile: rel(filePath),
    });
  }
  return defs;
}

function matchesEndpoint(call: string, endpoint: string): boolean {
  const c = normalizePath(call);
  const e = normalizePath(endpoint);
  return c === e || c.startsWith(`${e}/`) || e.startsWith(`${c}/`);
}

function scoreSeverity(status: Status): { severity: Severity; priority: Priority } {
  switch (status) {
    case 'PRODUCTION_BLOCKER':
      return { severity: 'CRITICAL', priority: 'P0' };
    case 'MISSING_BACKEND':
    case 'MISSING_FRONTEND':
    case 'BROKEN_ACTION':
    case 'ROLE_MISMATCH':
      return { severity: 'HIGH', priority: 'P1' };
    case 'PLACEHOLDER':
    case 'MOCK_DATA':
    case 'DISCONNECTED':
      return { severity: 'MEDIUM', priority: 'P2' };
    default:
      return { severity: 'LOW', priority: 'P3' };
  }
}

function toMdTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`);
  return [head, sep, ...body].join('\n');
}

function main() {
  const appText = readText(APP_PATH);
  const shellText = readText(APP_SHELL_PATH);
  const indexText = readText(API_INDEX_PATH);

  const routeDefs = parseRoutes(appText);
  const navMap = parseNav(shellText);

  const mounts = parseApiMounts(indexText);
  const routeFiles = listFiles(API_ROUTES_DIR, '.ts');
  const apiDefs: ApiDef[] = [];
  for (const rf of routeFiles) {
    const key = path.basename(rf);
    const mountPath = mounts.get(key) || '/';
    apiDefs.push(...parseApiRoutes(rf, mountPath));
  }

  // Non-router endpoints mounted directly in index.ts.
  if (/app\.get\('\/health'/.test(indexText)) {
    apiDefs.push({ endpoint: '/health', method: 'GET', requiredRole: 'PUBLIC', controller: 'healthController', sourceFile: 'apps/api/src/index.ts' });
  }
  if (/app\.get\('\/__buildinfo'/.test(indexText)) {
    apiDefs.push({ endpoint: '/__buildinfo', method: 'GET', requiredRole: 'PUBLIC', controller: '__buildinfo', sourceFile: 'apps/api/src/index.ts' });
  }

  const webFiles = listFiles(WEB_SRC, '.tsx').concat(listFiles(WEB_SRC, '.ts'));
  const apiCallUsage = new Map<string, string[]>();
  const keywordHits: Array<{ file: string; hits: string[] }> = [];
  for (const wf of webFiles) {
    const text = readText(wf);
    const calls = extractApiFetchCalls(text);
    for (const c of calls) {
      const arr = apiCallUsage.get(c) || [];
      arr.push(rel(wf));
      apiCallUsage.set(c, arr);
    }
    const matches = text.match(KEYWORD_RE);
    if (matches && matches.length > 0) {
      keywordHits.push({ file: rel(wf), hits: Array.from(new Set(matches.map((x) => x.toLowerCase()))).slice(0, 8) });
    }
  }

  const routeRows: RouteAuditRow[] = [];
  const routeByPath = new Map(routeDefs.map((r) => [r.route, r]));
  for (const scoped of SCOPE_ROUTES) {
    const def = routeByPath.get(scoped.route);
    if (!def) {
      const status: Status = 'DISCONNECTED';
      const sev = scoreSeverity(status);
      routeRows.push({
        route: scoped.route,
        pageComponent: 'MISSING_ROUTE',
        requiredRole: 'AUTHENTICATED',
        visibleNavLabel: navMap.get(scoped.route) || '-',
        primaryActions: [],
        backendEndpointsUsed: [],
        currentStatus: status,
        issue: 'Route is missing from App route wiring.',
        severity: sev.severity,
        fixRequired: 'Add the missing route or remove dead navigation entry.',
        priority: sev.priority,
      });
      continue;
    }

    const componentFile = pagePath(def.component);
    if (!componentFile) {
      const status: Status = 'MISSING_FRONTEND';
      const sev = scoreSeverity(status);
      routeRows.push({
        route: scoped.route,
        pageComponent: def.component,
        requiredRole: def.requiredRole,
        visibleNavLabel: navMap.get(scoped.route) || scoped.label,
        primaryActions: [],
        backendEndpointsUsed: [],
        currentStatus: status,
        issue: 'Route points to missing page component file.',
        severity: sev.severity,
        fixRequired: 'Restore or replace the page component implementation.',
        priority: sev.priority,
      });
      continue;
    }

    const pageText = readText(componentFile);
    const endpoints = extractApiFetchCalls(pageText);
    const actions = extractActions(pageText);
    const hasMock = MOCK_RE.test(pageText);
    const hasPlaceholder = PLACEHOLDER_RE.test(pageText);

    const missingApis = endpoints
      .map((ep) => ({ raw: ep, normalized: normalizePath(ep.startsWith('/') ? ep : `/${ep}`) }))
      .filter((ep) => !apiDefs.some((api) => matchesEndpoint(ep.normalized, api.endpoint)))
      .map((ep) => ep.raw);

    let status: Status = 'COMPLETE';
    let issue = 'None';
    let fixRequired = 'None';

    if (missingApis.length > 0) {
      status = 'MISSING_BACKEND';
      issue = `Frontend calls missing API endpoints: ${missingApis.join(', ')}`;
      fixRequired = 'Implement missing backend endpoints or correct frontend API paths.';
    } else if (actions.unboundButtons > 0 || actions.formsWithoutSubmit > 0) {
      status = 'BROKEN_ACTION';
      issue = `Found ${actions.unboundButtons} button(s) without handlers and ${actions.formsWithoutSubmit} form(s) without onSubmit.`;
      fixRequired = 'Attach handlers to action buttons/forms or remove dead actions.';
    } else if (hasMock) {
      status = 'MOCK_DATA';
      issue = 'Mock/fake/demo markers detected in page source.';
      fixRequired = 'Replace mock data paths with production API-backed data flows.';
    } else if (hasPlaceholder) {
      status = 'PLACEHOLDER';
      issue = 'Placeholder or TODO/FIXME markers detected in page source.';
      fixRequired = 'Complete unfinished implementation and remove placeholder markers.';
    } else if (endpoints.length === 0) {
      status = 'PARTIAL';
      issue = 'No direct apiFetch usage found in page file (child hook/component may own data).';
      fixRequired = 'Confirm data wiring and ensure loading/empty/error states are fully implemented.';
    }

    if (
      ['MISSING_BACKEND', 'MISSING_FRONTEND', 'BROKEN_ACTION', 'ROLE_MISMATCH', 'DISCONNECTED'].includes(status) &&
      ['/dashboard', '/credits', '/reports', '/investor', '/admin/users', '/admin/analyses', '/admin/properties'].includes(scoped.route)
    ) {
      status = 'PRODUCTION_BLOCKER';
      issue = `Core workflow blocker: ${issue}`;
      fixRequired = `Priority fix required for MVP route ${scoped.route}. ${fixRequired}`;
    }

    const sev = scoreSeverity(status);
    routeRows.push({
      route: scoped.route,
      pageComponent: def.component,
      requiredRole: def.requiredRole,
      visibleNavLabel: navMap.get(scoped.route) || scoped.label,
      primaryActions: actions.actions,
      backendEndpointsUsed: endpoints,
      currentStatus: status,
      issue,
      severity: sev.severity,
      fixRequired,
      priority: sev.priority,
    });
  }

  const apiRows: ApiAuditRow[] = [];
  for (const api of apiDefs) {
    const consumers = Array.from(apiCallUsage.entries())
      .filter(([call]) => matchesEndpoint(call, api.endpoint))
      .flatMap(([, files]) => files)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort();

    let status: Status = 'COMPLETE';
    let issue = 'None';
    let fixRequired = 'None';

    if (/UNKNOWN_HANDLER/.test(api.controller)) {
      status = 'PARTIAL';
      issue = 'Unable to parse controller handler expression.';
      fixRequired = 'Use explicit controller method references in route definitions.';
    } else if (consumers.length === 0 && api.requiredRole !== 'PUBLIC') {
      status = 'DISCONNECTED';
      issue = 'No frontend consumer found for this protected API endpoint.';
      fixRequired = 'Wire the endpoint into intended UI flow or remove dead API surface.';
    }

    const sev = scoreSeverity(status);
    apiRows.push({
      endpoint: api.endpoint,
      method: api.method,
      requiredRole: api.requiredRole,
      controller: `${api.controller} (${api.sourceFile})`,
      frontendConsumers: consumers,
      currentStatus: status,
      issue,
      severity: sev.severity,
      fixRequired,
      priority: sev.priority,
    });
  }

  const missingGroups = REQUIRED_API_GROUPS.filter(
    (group) => !apiDefs.some((api) => api.endpoint.startsWith(group))
  );
  for (const group of missingGroups) {
    const status: Status = 'MISSING_BACKEND';
    const sev = scoreSeverity(status);
    apiRows.push({
      endpoint: `${group}/*`,
      method: 'ANY',
      requiredRole: 'AUTHENTICATED',
      controller: 'MISSING_GROUP',
      frontendConsumers: [],
      currentStatus: status,
      issue: `Expected API group missing from backend routes: ${group}`,
      severity: sev.severity,
      fixRequired: 'Add missing API route group or adjust MVP scope definition.',
      priority: sev.priority,
    });
  }

  const routeStatusCounts = routeRows.reduce<Record<Status, number>>((acc, row) => {
    acc[row.currentStatus] = (acc[row.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const apiStatusCounts = apiRows.reduce<Record<Status, number>>((acc, row) => {
    acc[row.currentStatus] = (acc[row.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const blockers = routeRows.filter((r) => r.currentStatus === 'PRODUCTION_BLOCKER')
    .map((r) => ({ scope: 'route', key: r.route, issue: r.issue, priority: r.priority }))
    .concat(
      apiRows
        .filter((a) => a.currentStatus === 'PRODUCTION_BLOCKER')
        .map((a) => ({ scope: 'api', key: `${a.method} ${a.endpoint}`, issue: a.issue, priority: a.priority }))
    );

  const partialPages = routeRows.filter((r) => r.currentStatus === 'PARTIAL');
  const placeholderOrMock = routeRows.filter((r) => ['PLACEHOLDER', 'MOCK_DATA'].includes(r.currentStatus));
  const brokenActions = routeRows.filter((r) => r.currentStatus === 'BROKEN_ACTION');
  const missingApis = apiRows.filter((a) => ['MISSING_BACKEND', 'DISCONNECTED'].includes(a.currentStatus));

  const totalEntities = routeRows.length + apiRows.length;
  const completeEntities = routeRows.filter((r) => r.currentStatus === 'COMPLETE').length + apiRows.filter((a) => a.currentStatus === 'COMPLETE').length;
  const completenessScore = totalEntities === 0 ? 0 : Math.round((completeEntities / totalEntities) * 100);

  const top10 = routeRows
    .filter((r) => ['PRODUCTION_BLOCKER', 'MISSING_BACKEND', 'MISSING_FRONTEND', 'BROKEN_ACTION', 'ROLE_MISMATCH', 'DISCONNECTED', 'PARTIAL', 'PLACEHOLDER', 'MOCK_DATA'].includes(r.currentStatus))
    .sort((a, b) => {
      const p = { P0: 0, P1: 1, P2: 2, P3: 3 } as Record<Priority, number>;
      const s = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as Record<Severity, number>;
      return p[a.priority] - p[b.priority] || s[a.severity] - s[b.severity];
    })
    .slice(0, 10)
    .map((r) => ({ route: r.route, status: r.currentStatus, issue: r.issue, fixRequired: r.fixRequired, priority: r.priority }));

  const routeMapPayload = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: routeRows.length,
      statusCounts: routeStatusCounts,
    },
    rows: routeRows,
  };

  const apiAuditPayload = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: apiRows.length,
      statusCounts: apiStatusCounts,
      missingGroups,
    },
    rows: apiRows,
  };

  const completenessPayload = {
    generatedAt: new Date().toISOString(),
    phase: 'P2.1 — FULL MVP FUNCTIONAL COMPLETENESS AUDIT',
    baselineCommit: '38355679',
    completenessScore,
    summary: {
      routes: routeStatusCounts,
      apis: apiStatusCounts,
      keywordHits,
    },
    productionBlockers: blockers,
    partialPages,
    placeholderOrMockAreas: placeholderOrMock,
    brokenActions,
    missingApis,
    top10NextFixes: top10,
    recommendedNextPhase: 'P2.2 — MVP Blocker Closure (no connector/TUCBS implementation)',
  };

  writeJson(path.join(PROOF_DIR, 'mvp-route-action-map.json'), routeMapPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-api-contract-audit.json'), apiAuditPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-functional-completeness-audit.json'), completenessPayload);

  const routeTable = toMdTable(
    [
      'route',
      'page/component',
      'requiredRole',
      'visibleNavLabel',
      'primaryActions',
      'backendEndpointsUsed',
      'currentStatus',
      'issue',
      'severity',
      'fixRequired',
      'priority',
    ],
    routeRows.map((r) => [
      r.route,
      r.pageComponent,
      r.requiredRole,
      r.visibleNavLabel || '-',
      r.primaryActions.length ? r.primaryActions.join(', ') : '-',
      r.backendEndpointsUsed.length ? r.backendEndpointsUsed.join(', ') : '-',
      r.currentStatus,
      r.issue,
      r.severity,
      r.fixRequired,
      r.priority,
    ])
  );

  const apiTable = toMdTable(
    [
      'endpoint',
      'method',
      'requiredRole',
      'controller',
      'frontendConsumers',
      'currentStatus',
      'issue',
      'severity',
      'fixRequired',
      'priority',
    ],
    apiRows.map((a) => [
      a.endpoint,
      a.method,
      a.requiredRole,
      a.controller,
      a.frontendConsumers.length ? a.frontendConsumers.join(', ') : '-',
      a.currentStatus,
      a.issue,
      a.severity,
      a.fixRequired,
      a.priority,
    ])
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-route-action-map.md'),
    [
      '# MVP Route Action Map',
      '',
      `Generated at: ${routeMapPayload.generatedAt}`,
      `Total routes audited: ${routeRows.length}`,
      '',
      routeTable,
    ].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-api-contract-audit.md'),
    [
      '# MVP API Contract Audit',
      '',
      `Generated at: ${apiAuditPayload.generatedAt}`,
      `Total APIs audited: ${apiRows.length}`,
      `Missing API groups: ${missingGroups.length ? missingGroups.join(', ') : 'none'}`,
      '',
      apiTable,
    ].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-functional-completeness-audit.md'),
    [
      '# MVP Functional Completeness Audit',
      '',
      `Generated at: ${completenessPayload.generatedAt}`,
      `Baseline commit: ${completenessPayload.baselineCommit}`,
      `MVP completeness score: ${completenessScore}`,
      '',
      '## Production blockers',
      ...(blockers.length
        ? blockers.map((b) => `- [${b.scope}] ${b.key}: ${b.issue} (${b.priority})`)
        : ['- none']),
      '',
      '## Partial pages',
      ...(partialPages.length ? partialPages.map((p) => `- ${p.route} (${p.pageComponent}): ${p.issue}`) : ['- none']),
      '',
      '## Placeholder/mock areas',
      ...(placeholderOrMock.length
        ? placeholderOrMock.map((p) => `- ${p.route} (${p.currentStatus}): ${p.issue}`)
        : ['- none']),
      '',
      '## Broken actions',
      ...(brokenActions.length ? brokenActions.map((b) => `- ${b.route}: ${b.issue}`) : ['- none']),
      '',
      '## Missing APIs',
      ...(missingApis.length
        ? missingApis.slice(0, 30).map((m) => `- ${m.method} ${m.endpoint}: ${m.issue}`)
        : ['- none']),
      '',
      '## Top 10 next fixes',
      ...(top10.length
        ? top10.map((t, i) => `${i + 1}. ${t.route} - ${t.status} - ${t.issue} (${t.priority})`)
        : ['1. none']),
      '',
      `Recommended next phase: ${completenessPayload.recommendedNextPhase}`,
    ].join('\n')
  );

  console.log(
    JSON.stringify(
      {
        overallStatus: 'PASS',
        step: 'audit:mvp-completeness',
        completenessScore,
        proof: {
          completeness: 'proof/mvp-functional-completeness-audit.json',
          routeMap: 'proof/mvp-route-action-map.json',
          apiContract: 'proof/mvp-api-contract-audit.json',
        },
      },
      null,
      2
    )
  );
}

main();