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
type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

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

type SearchFinding = {
  rule: string;
  file: string;
  count: number;
};

const ROOT = process.cwd();
const WEB_SRC = path.join(ROOT, 'apps/web/src');
const API_SRC = path.join(ROOT, 'apps/api/src');
const PROOF_DIR = path.join(ROOT, 'proof');

const APP_PATH = path.join(WEB_SRC, 'App.tsx');
const APP_SHELL_PATH = path.join(WEB_SRC, 'components/AppShell.tsx');
const API_INDEX_PATH = path.join(API_SRC, 'index.ts');
const API_ROUTES_DIR = path.join(API_SRC, 'routes');

const MOCK_RE = /\bmock\b|mockData|demo data|hardcoded|stubbed/i;
const PLACEHOLDER_RE = /coming soon|not implemented|todo|fixme|under construction/i;

const SCOPE_ROUTES: Array<{ label: string; route: string }> = [
  { label: 'dashboard', route: '/dashboard' },
  { label: 'credits', route: '/credits' },
  { label: 'reports', route: '/reports' },
  { label: 'analyses', route: '/analyses' },
  { label: 'investor', route: '/investor' },
  { label: 'saved analyses', route: '/investor/saved-analyses' },
  { label: 'watchlist', route: '/investor/watchlist' },
  { label: 'portfolio', route: '/investor/portfolio' },
  { label: 'organizations', route: '/organizations' },
  { label: 'notifications', route: '/notifications' },
  { label: 'properties', route: '/properties' },
  { label: 'property detail', route: '/properties/:id' },
  { label: 'property documents', route: '/properties/:id/documents' },
  { label: 'admin users', route: '/admin/users' },
  { label: 'admin analyses', route: '/admin/analyses' },
  { label: 'admin credit ledger', route: '/admin/credit-ledger' },
  { label: 'admin stripe sessions', route: '/admin/stripe-sessions' },
  { label: 'admin properties', route: '/admin/properties' },
  { label: 'admin property documents', route: '/admin/property-documents' },
  { label: 'admin runtime', route: '/admin/runtime' },
  { label: 'admin deployment', route: '/admin/deployment' },
  { label: 'admin observability', route: '/admin/observability' },
  { label: 'admin analytics', route: '/admin/analytics' },
  { label: 'admin connectors', route: '/admin/connectors' },
  { label: 'admin OGC connectors', route: '/admin/connectors/ogc' },
  { label: 'admin TUCBS connector', route: '/admin/connectors/tucbs' },
  { label: 'audit timeline', route: '/admin/audit-timeline' },
];

const REQUIRED_API_GROUPS = [
  '/auth',
  '/admin/users',
  '/credits',
  '/stripe',
  '/analysis',
  '/properties',
  '/documents',
  '/organizations',
  '/notifications',
  '/admin/connectors',
  '/admin/ogc',
  '/admin/tucbs',
  '/admin/audit-events',
  '/admin/runtime',
  '/admin/deployment',
  '/admin/observability',
  '/admin/analytics',
  '/health',
  '/__buildinfo',
];

const MANDATORY_SEARCH_RULES: Array<{ name: string; re: RegExp }> = [
  { name: 'TODO', re: /\bTODO\b/gi },
  { name: 'FIXME', re: /\bFIXME\b/gi },
  { name: 'mock', re: /\bmock\b/gi },
  { name: 'placeholder', re: /placeholder/gi },
  { name: 'fake', re: /\bfake\b/gi },
  { name: 'demo', re: /\bdemo\b/gi },
  { name: 'coming soon', re: /coming soon/gi },
  { name: 'not implemented', re: /not implemented/gi },
  { name: 'console.log', re: /console\.log\(/gi },
  { name: 'hardcoded demo data', re: /hardcoded demo data/gi },
  { name: 'empty buttons', re: /<button[^>]*>\s*<\/button>/gi },
  { name: 'forms without submit handlers', re: /<form(?![^>]*onSubmit)[^>]*>/gi },
  { name: 'links to missing routes', re: /to="\/[^"\n]+"/gi },
  { name: 'try/catch swallowing errors', re: /catch\s*\([^)]*\)\s*\{\s*\}/gi },
  { name: 'missing loading states', re: /loading\s*:\s*false/gi },
  { name: 'missing empty states', re: /no data|empty state/gi },
  { name: 'official evidence labeling gaps', re: /USER_PROVIDED_OFFICIAL_EVIDENCE|VERIFIED_BY_APPROVED_CONNECTOR|PUBLIC_SOURCE|UNVERIFIED|MISSING|NEEDS_MANUAL_REVIEW/g },
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

function listFiles(dir: string, exts: string[], out: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(abs, exts, out);
    } else if (entry.isFile() && exts.some((ext) => abs.endsWith(ext))) {
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

function extractActions(text: string): { actions: string[]; unboundButtons: number; formsWithoutSubmit: number; links: string[] } {
  const actions = new Set<string>();
  const links: string[] = [];
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
  while ((l = linkRe.exec(text)) !== null) {
    links.push(l[1]);
    actions.add(`link:${l[1]}`);
  }

  return { actions: Array.from(actions).slice(0, 16), unboundButtons, formsWithoutSubmit, links };
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
  const c = normalizePath(call.startsWith('/') ? call : `/${call}`);
  const e = normalizePath(endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
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
    case 'PARTIAL':
      return { severity: 'LOW', priority: 'P3' };
    default:
      return { severity: 'LOW', priority: 'P4' };
  }
}

function toMdTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`);
  return [head, sep, ...body].join('\n');
}

function scanMandatoryFindings(files: string[]): SearchFinding[] {
  const findings: SearchFinding[] = [];
  for (const file of files) {
    const text = readText(file);
    for (const rule of MANDATORY_SEARCH_RULES) {
      const matches = text.match(rule.re);
      if (matches && matches.length > 0) {
        findings.push({ rule: rule.name, file: rel(file), count: matches.length });
      }
    }
  }
  return findings;
}

function main() {
  const appText = readText(APP_PATH);
  const shellText = readText(APP_SHELL_PATH);
  const indexText = readText(API_INDEX_PATH);

  const routeDefs = parseRoutes(appText);
  const navMap = parseNav(shellText);

  const mounts = parseApiMounts(indexText);
  const routeFiles = listFiles(API_ROUTES_DIR, ['.ts']);
  const apiDefs: ApiDef[] = [];
  for (const rf of routeFiles) {
    const key = path.basename(rf);
    const mountPath = mounts.get(key) || '/';
    apiDefs.push(...parseApiRoutes(rf, mountPath));
  }

  if (/app\.get\('\/health'/.test(indexText)) {
    apiDefs.push({ endpoint: '/health', method: 'GET', requiredRole: 'PUBLIC', controller: 'healthController', sourceFile: 'apps/api/src/index.ts' });
  }
  if (/app\.get\('\/__buildinfo'/.test(indexText)) {
    apiDefs.push({ endpoint: '/__buildinfo', method: 'GET', requiredRole: 'PUBLIC', controller: '__buildinfo', sourceFile: 'apps/api/src/index.ts' });
  }

  const webFiles = listFiles(WEB_SRC, ['.tsx', '.ts']);
  const apiFiles = listFiles(API_SRC, ['.ts']);
  const apiCallUsage = new Map<string, string[]>();

  for (const wf of webFiles) {
    const text = readText(wf);
    const calls = extractApiFetchCalls(text);
    for (const c of calls) {
      const arr = apiCallUsage.get(c) || [];
      arr.push(rel(wf));
      apiCallUsage.set(c, arr);
    }
  }

  const routeRows: RouteAuditRow[] = [];
  const routeByPath = new Map(routeDefs.map((r) => [normalizePath(r.route), r]));
  const knownRoutes = new Set(routeDefs.map((r) => normalizePath(r.route)));

  for (const scoped of SCOPE_ROUTES) {
    const normalizedScope = normalizePath(scoped.route);
    const def = routeByPath.get(normalizedScope);
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
        fixRequired: 'Add route wiring or remove dead route dependency.',
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
        issue: 'Route references missing page component.',
        severity: sev.severity,
        fixRequired: 'Restore component file or point route to existing component.',
        priority: sev.priority,
      });
      continue;
    }

    const pageText = readText(componentFile);
    const endpoints = extractApiFetchCalls(pageText);
    const actions = extractActions(pageText);
    const hasMock = MOCK_RE.test(pageText);
    const hasPlaceholder = PLACEHOLDER_RE.test(pageText);

    const missingApis = endpoints.filter((ep) => !apiDefs.some((api) => matchesEndpoint(ep, api.endpoint)));
    const deadLinks = actions.links.filter((to) => !knownRoutes.has(normalizePath(to)) && !to.startsWith('http'));

    let status: Status = 'COMPLETE';
    let issue = 'None';
    let fixRequired = 'None';

    if (missingApis.length > 0) {
      status = 'MISSING_BACKEND';
      issue = `Frontend calls missing API endpoints: ${missingApis.join(', ')}`;
      fixRequired = 'Implement endpoint or correct frontend API path.';
    } else if (actions.unboundButtons > 0 || actions.formsWithoutSubmit > 0 || deadLinks.length > 0) {
      status = 'BROKEN_ACTION';
      issue = `Unbound buttons=${actions.unboundButtons}, formsWithoutSubmit=${actions.formsWithoutSubmit}, deadLinks=${deadLinks.length}`;
      fixRequired = 'Bind handlers, wire form submit, and remove/fix dead links.';
    } else if (hasMock) {
      status = 'MOCK_DATA';
      issue = 'Mock/fake/demo marker detected in page source.';
      fixRequired = 'Replace mock/demo data with production-backed flow.';
    } else if (hasPlaceholder) {
      status = 'PLACEHOLDER';
      issue = 'Placeholder/TODO/FIXME marker detected in page source.';
      fixRequired = 'Complete implementation and remove placeholder markers.';
    } else if (endpoints.length === 0) {
      status = 'PARTIAL';
      issue = 'No direct apiFetch in page; data flow may be indirect and needs validation.';
      fixRequired = 'Verify wiring via hooks/components and ensure complete UX states.';
    }

    if (
      ['MISSING_BACKEND', 'MISSING_FRONTEND', 'BROKEN_ACTION', 'ROLE_MISMATCH', 'DISCONNECTED'].includes(status) &&
      ['/dashboard', '/credits', '/reports', '/investor', '/properties', '/admin/users', '/admin/analyses', '/admin/properties'].includes(scoped.route)
    ) {
      status = 'PRODUCTION_BLOCKER';
      issue = `Core flow blocker: ${issue}`;
      fixRequired = `Priority fix required for ${scoped.route}. ${fixRequired}`;
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
      issue = 'Route parser could not resolve controller expression.';
      fixRequired = 'Use explicit controller method reference in route definition.';
    } else if (api.endpoint.startsWith('/admin') && api.requiredRole !== 'ADMIN') {
      status = 'ROLE_MISMATCH';
      issue = 'Admin endpoint appears without strict admin middleware match.';
      fixRequired = 'Enforce admin middleware on endpoint.';
    } else if (consumers.length === 0 && api.requiredRole !== 'PUBLIC') {
      status = 'DISCONNECTED';
      issue = 'No frontend consumer detected for protected endpoint.';
      fixRequired = 'Wire endpoint to UI flow or explicitly de-scope.';
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

  const missingGroups = REQUIRED_API_GROUPS.filter((group) => !apiDefs.some((api) => normalizePath(api.endpoint).startsWith(normalizePath(group))));
  for (const group of missingGroups) {
    const status: Status = 'MISSING_BACKEND';
    const sev = scoreSeverity(status);
    apiRows.push({
      endpoint: `${group}/*`,
      method: 'ANY',
      requiredRole: group.startsWith('/admin') ? 'ADMIN' : 'AUTHENTICATED',
      controller: 'MISSING_GROUP',
      frontendConsumers: [],
      currentStatus: status,
      issue: `Expected API group missing from route map: ${group}`,
      severity: sev.severity,
      fixRequired: 'Implement missing API group or document formal out-of-scope decision.',
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

  const blockers = routeRows
    .filter((r) => r.currentStatus === 'PRODUCTION_BLOCKER')
    .map((r) => ({ scope: 'route', key: r.route, issue: r.issue, priority: r.priority }))
    .concat(
      apiRows
        .filter((a) => a.currentStatus === 'PRODUCTION_BLOCKER')
        .map((a) => ({ scope: 'api', key: `${a.method} ${a.endpoint}`, issue: a.issue, priority: a.priority }))
    );

  const partialPages = routeRows.filter((r) => r.currentStatus === 'PARTIAL');
  const placeholderOrMock = routeRows.filter((r) => r.currentStatus === 'PLACEHOLDER' || r.currentStatus === 'MOCK_DATA');
  const brokenActions = routeRows.filter((r) => r.currentStatus === 'BROKEN_ACTION' || (r.currentStatus === 'PRODUCTION_BLOCKER' && /Unbound buttons|formsWithoutSubmit|deadLinks/.test(r.issue)));
  const missingApis = apiRows.filter((a) => a.currentStatus === 'MISSING_BACKEND' || a.currentStatus === 'DISCONNECTED');

  const searchFindings = scanMandatoryFindings([...webFiles, ...apiFiles]);

  const totalEntities = routeRows.length + apiRows.length;
  const completeEntities = routeRows.filter((r) => r.currentStatus === 'COMPLETE').length + apiRows.filter((a) => a.currentStatus === 'COMPLETE').length;
  const completenessScore = totalEntities === 0 ? 0 : Math.round((completeEntities / totalEntities) * 100);

  const top10 = routeRows
    .filter((r) => r.currentStatus !== 'COMPLETE')
    .sort((a, b) => {
      const p = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 } as Record<Priority, number>;
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

  const brokenActionsPayload = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: brokenActions.length,
    },
    rows: brokenActions,
  };

  const mockPlaceholderPayload = {
    generatedAt: new Date().toISOString(),
    summary: {
      routeRows: placeholderOrMock.length,
      searchFindings: searchFindings.length,
    },
    routeRows: placeholderOrMock,
    searchFindings,
  };

  const completenessPayload = {
    generatedAt: new Date().toISOString(),
    phase: 'P2.1 — FULL MVP FUNCTIONAL COMPLETENESS AUDIT',
    completenessScore,
    scoringBasis: {
      totalEntities,
      completeEntities,
      formula: 'round((completeEntities / totalEntities) * 100)',
    },
    summary: {
      routes: routeStatusCounts,
      apis: apiStatusCounts,
      searchFindings: searchFindings.slice(0, 100),
    },
    productionBlockers: blockers,
    partialPages,
    placeholderOrMockAreas: placeholderOrMock,
    brokenActions,
    missingApis,
    top10NextFixes: top10,
    recommendedNextPhase: 'P2.1A-FIX — fix P0/P1 MVP blockers from audit',
  };

  writeJson(path.join(PROOF_DIR, 'mvp-route-action-map.json'), routeMapPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-api-contract-audit.json'), apiAuditPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-broken-actions-audit.json'), brokenActionsPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-mock-placeholder-audit.json'), mockPlaceholderPayload);
  writeJson(path.join(PROOF_DIR, 'mvp-functional-completeness-audit.json'), completenessPayload);

  const routeTable = toMdTable(
    ['route', 'page/component', 'requiredRole', 'visibleNavLabel', 'primaryActions', 'backendEndpointsUsed', 'currentStatus', 'issue', 'severity', 'fixRequired', 'priority'],
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
    ['endpoint', 'method', 'requiredRole', 'controller', 'frontendConsumers', 'currentStatus', 'issue', 'severity', 'fixRequired', 'priority'],
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
    ['# MVP Route Action Map', '', `Generated at: ${routeMapPayload.generatedAt}`, `Total routes audited: ${routeRows.length}`, '', routeTable].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-api-contract-audit.md'),
    ['# MVP API Contract Audit', '', `Generated at: ${apiAuditPayload.generatedAt}`, `Total APIs audited: ${apiRows.length}`, `Missing API groups: ${missingGroups.length ? missingGroups.join(', ') : 'none'}`, '', apiTable].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-broken-actions-audit.md'),
    [
      '# MVP Broken Actions Audit',
      '',
      `Generated at: ${brokenActionsPayload.generatedAt}`,
      `Total broken action rows: ${brokenActions.length}`,
      '',
      ...(brokenActions.length
        ? brokenActions.map((row) => `- ${row.route}: ${row.issue} (${row.priority})`)
        : ['- none']),
    ].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-mock-placeholder-audit.md'),
    [
      '# MVP Mock Placeholder Audit',
      '',
      `Generated at: ${mockPlaceholderPayload.generatedAt}`,
      `Route rows flagged: ${placeholderOrMock.length}`,
      `Mandatory search findings: ${searchFindings.length}`,
      '',
      '## Route rows',
      ...(placeholderOrMock.length
        ? placeholderOrMock.map((row) => `- ${row.route}: ${row.currentStatus} - ${row.issue}`)
        : ['- none']),
      '',
      '## Search findings (first 80)',
      ...(searchFindings.length
        ? searchFindings.slice(0, 80).map((f) => `- ${f.rule}: ${f.file} (count=${f.count})`)
        : ['- none']),
    ].join('\n')
  );

  writeMd(
    path.join(PROOF_DIR, 'mvp-functional-completeness-audit.md'),
    [
      '# MVP Functional Completeness Audit',
      '',
      `Generated at: ${completenessPayload.generatedAt}`,
      `MVP completeness score: ${completenessScore}%`,
      `Scoring basis: ${completeEntities}/${totalEntities} entities COMPLETE`,
      '',
      '## Production blockers',
      ...(blockers.length ? blockers.map((b) => `- [${b.scope}] ${b.key}: ${b.issue} (${b.priority})`) : ['- none']),
      '',
      '## Partial pages',
      ...(partialPages.length ? partialPages.map((p) => `- ${p.route}: ${p.issue}`) : ['- none']),
      '',
      '## Placeholder/mock areas',
      ...(placeholderOrMock.length ? placeholderOrMock.map((p) => `- ${p.route}: ${p.issue}`) : ['- none']),
      '',
      '## Broken actions',
      ...(brokenActions.length ? brokenActions.map((b) => `- ${b.route}: ${b.issue}`) : ['- none']),
      '',
      '## Missing APIs',
      ...(missingApis.length ? missingApis.slice(0, 40).map((m) => `- ${m.method} ${m.endpoint}: ${m.issue}`) : ['- none']),
      '',
      '## Top 10 next fixes',
      ...(top10.length ? top10.map((t, i) => `${i + 1}. ${t.route} - ${t.status} - ${t.issue} (${t.priority})`) : ['1. none']),
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
          brokenActions: 'proof/mvp-broken-actions-audit.json',
          mockPlaceholder: 'proof/mvp-mock-placeholder-audit.json',
        },
      },
      null,
      2
    )
  );
}

main();
