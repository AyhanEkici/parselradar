import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofPath = path.join(ROOT, 'proof', 'route-wiring-audit.json');
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');
const shellPath = path.join(ROOT, 'apps', 'web', 'src', 'components', 'AppShell.tsx');

function fail(reason: string, detail?: Record<string, unknown>): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:route-wiring', reason, detail: detail || null }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(runtimePath) || !fs.existsSync(shellPath)) {
  fail('missing_runtime_inputs', { expected: ['proof/live-browser-mvp-runtime.json', 'apps/web/src/components/AppShell.tsx'] });
}

const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as {
  routeResults?: Array<{ label?: string; path?: string; status?: string; detail?: string }>;
};
const shellText = fs.readFileSync(shellPath, 'utf8');
const navMatches = [...shellText.matchAll(/<Link to="([^"]+)"[^>]*>([^<]+)<\/Link>/g)].map((match) => ({ path: match[1], name: match[2].trim() }));
const routeResults = Array.isArray(runtime.routeResults) ? runtime.routeResults : [];

const routes = navMatches.map((nav) => {
  const runtimeMatch = routeResults.find((item) => item.path === nav.path);
  const isPass = String(runtimeMatch?.status || '').toUpperCase() === 'PASS';
  return {
    name: nav.name,
    path: nav.path,
    classification: isPass ? 'WORKING' : 'STALE_STATE',
    status: isPass ? 'PASS' : 'FAIL',
    detail: runtimeMatch?.detail || 'No runtime traversal result recorded for nav route.',
  };
});

const summary = {
  total: routes.length,
  working: routes.filter((route) => route.status === 'PASS').length,
  partial: 0,
  broken: 0,
  disconnected: 0,
  unauthorized: 0,
  missingBackend: 0,
  missingFrontend: 0,
  looping: 0,
  staleState: routes.filter((route) => route.status === 'FAIL').length,
  invalidRedirect: 0,
  fail: routes.filter((route) => route.status === 'FAIL').length,
};

const payload = {
  generatedAt: new Date().toISOString(),
  overallStatus: summary.fail === 0 ? 'PASS' : 'FAIL',
  summary,
  routes,
};

fs.writeFileSync(proofPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

if (payload.overallStatus !== 'PASS') {
  fail('route_wiring_not_stable', { overallStatus: payload.overallStatus, summary: payload.summary, proof: 'proof/route-wiring-audit.json' });
}

console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:route-wiring', proof: 'proof/route-wiring-audit.json' }, null, 2));
