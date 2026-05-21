import fs from 'fs';
import path from 'path';

type Check = { name: string; status: 'PASS' | 'FAIL'; detail: string };

type RuntimeFlow = { status?: string; detail?: string };

type RuntimeProof = {
  overallStatus?: string;
  flows?: {
    pilotAdminFlow?: RuntimeFlow;
    ctrlF5Persistence?: RuntimeFlow;
    backForwardPersistence?: RuntimeFlow;
    adminRouteTraversal?: RuntimeFlow;
    authMeStorm?: RuntimeFlow;
  };
  runtimeEvidence?: {
    authMe?: { total?: number; status401?: number };
  };
};

const ROOT = process.cwd();
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');
const outJson = path.join(ROOT, 'proof', 'auth-shell-consistency.json');
const outMd = path.join(ROOT, 'proof', 'auth-shell-consistency.md');

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function push(checks: Check[], name: string, pass: boolean, detail: string) {
  checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

function toMd(result: { overallStatus: string; checks: Check[]; runtimePath: string | null }): string {
  const lines = [
    '# Auth Shell Consistency',
    '',
    `Overall status: ${result.overallStatus}`,
    `Runtime proof source: ${result.runtimePath || 'missing'}`,
    '',
    '## Checks',
  ];
  for (const c of result.checks) {
    lines.push(`- ${c.status} - ${c.name}: ${c.detail}`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const checks: Check[] = [];

  const app = readText('apps/web/src/App.tsx');
  const shell = readText('apps/web/src/components/AppShell.tsx');
  const auth = readText('apps/web/src/hooks/useAuth.tsx');

  push(checks, 'App wraps routes in AppShell', app.includes('<AppShell>') && app.includes('<AppRoutes />'), 'App shell must remain mounted around route tree.');
  push(checks, 'AppShell derives auth from context', shell.includes('useAuth()') && !shell.includes('hasAuthSession('), 'Navbar visibility must not infer auth from storage.');
  push(checks, 'AppShell keeps shell visible during boot/authenticating', shell.includes("authState === 'authenticating'") && shell.includes("authState === 'booting'"), 'Transient hydration must not collapse shell.');
  push(checks, 'Hydration marks auth phase boundaries', auth.includes('setAuthHydrating(true)') && auth.includes('setAuthHydrating(false)'), 'Hydration lifecycle must be explicit and deterministic.');

  let runtime: RuntimeProof | null = null;
  if (fs.existsSync(runtimePath)) {
    runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as RuntimeProof;
  }

  if (!runtime) {
    push(checks, 'Runtime proof exists', false, 'Missing proof/live-browser-mvp-runtime.json');
  } else {
    const pilot = String(runtime.flows?.pilotAdminFlow?.status || '').toUpperCase() === 'PASS';
    const ctrlF5 = String(runtime.flows?.ctrlF5Persistence?.status || '').toUpperCase() === 'PASS';
    const authMeStorm = String(runtime.flows?.authMeStorm?.status || '').toUpperCase() === 'PASS';
    const status401 = Number(runtime.runtimeEvidence?.authMe?.status401 || 0);

    push(checks, 'Runtime pilot shell persistence', pilot, runtime.flows?.pilotAdminFlow?.detail || 'pilot flow unavailable');
    push(checks, 'Runtime CTRL+F5 shell persistence', ctrlF5, runtime.flows?.ctrlF5Persistence?.detail || 'ctrl+f5 flow unavailable');
    push(checks, 'Runtime auth/me storm bounded', authMeStorm && status401 === 0, `authMe status401=${status401}`);
  }

  const failed = checks.filter((c) => c.status === 'FAIL');
  const result = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
    runtimePath: fs.existsSync(runtimePath) ? 'proof/live-browser-mvp-runtime.json' : null,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(outMd, `${toMd(result)}\n`, 'utf8');

  const output = { overallStatus: result.overallStatus, step: 'verify:auth-shell', proof: 'proof/auth-shell-consistency.json' };
  if (result.overallStatus !== 'PASS') {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(output, null, 2));
}

main();
