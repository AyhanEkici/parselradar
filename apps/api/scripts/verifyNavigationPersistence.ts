import fs from 'fs';
import path from 'path';

type Check = { name: string; status: 'PASS' | 'FAIL'; detail: string };
type RuntimeFlow = { status?: string; detail?: string };
type RuntimeProof = {
  flows?: {
    ctrlF5Persistence?: RuntimeFlow;
    backForwardPersistence?: RuntimeFlow;
    adminRouteTraversal?: RuntimeFlow;
    tokenLoginBounce?: RuntimeFlow;
  };
};

const ROOT = process.cwd();
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');
const outJson = path.join(ROOT, 'proof', 'navigation-persistence.json');
const outMd = path.join(ROOT, 'proof', 'navigation-persistence.md');

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function push(checks: Check[], name: string, pass: boolean, detail: string) {
  checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

function main() {
  const checks: Check[] = [];

  const app = readText('apps/web/src/App.tsx');
  const dashboard = readText('apps/web/src/pages/Dashboard.tsx');
  const shell = readText('apps/web/src/components/AppShell.tsx');

  push(checks, 'Protected routes use RequireAuth wrappers', app.includes('<RequireAuth><Dashboard /></RequireAuth>') && app.includes('<RequireAuth><Credits /></RequireAuth>'), 'Navigation safety must come from route wrappers, not page-local redirects.');
  push(checks, 'Dashboard internal navigation uses Link', dashboard.includes('<Link to="/properties/new"') && !dashboard.includes('<a href="/properties/new"'), 'Internal route transitions should avoid full page reload.');
  push(checks, 'AppShell nav uses router links', shell.includes('<Link to=') && !shell.includes('<a href='), 'Navbar routing should remain client-side and consistent.');

  if (!fs.existsSync(runtimePath)) {
    push(checks, 'Runtime navigation proof exists', false, 'Missing proof/live-browser-mvp-runtime.json');
  } else {
    const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as RuntimeProof;
    const ctrlF5 = String(runtime.flows?.ctrlF5Persistence?.status || '').toUpperCase() === 'PASS';
    const backForward = String(runtime.flows?.backForwardPersistence?.status || '').toUpperCase() === 'PASS';
    const adminTraversal = String(runtime.flows?.adminRouteTraversal?.status || '').toUpperCase() === 'PASS';
    const noTokenBounce = String(runtime.flows?.tokenLoginBounce?.status || '').toUpperCase() === 'PASS';

    push(checks, 'Runtime CTRL+F5 persistence', ctrlF5, runtime.flows?.ctrlF5Persistence?.detail || 'ctrl+f5 flow unavailable');
    push(checks, 'Runtime back/forward persistence', backForward, runtime.flows?.backForwardPersistence?.detail || 'history flow unavailable');
    push(checks, 'Runtime protected route traversal persistence', adminTraversal, runtime.flows?.adminRouteTraversal?.detail || 'admin traversal flow unavailable');
    push(checks, 'Runtime has no /login bounce with token', noTokenBounce, runtime.flows?.tokenLoginBounce?.detail || 'token bounce flow unavailable');
  }

  const failed = checks.filter((c) => c.status === 'FAIL');
  const result = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  const md = [
    '# Navigation Persistence',
    '',
    `Overall status: ${result.overallStatus}`,
    '',
    '## Checks',
    ...checks.map((c) => `- ${c.status} - ${c.name}: ${c.detail}`),
    '',
  ].join('\n');

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(outMd, `${md}\n`, 'utf8');

  const output = { overallStatus: result.overallStatus, step: 'verify:navigation-persistence', proof: 'proof/navigation-persistence.json' };
  if (result.overallStatus !== 'PASS') {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(output, null, 2));
}

main();
