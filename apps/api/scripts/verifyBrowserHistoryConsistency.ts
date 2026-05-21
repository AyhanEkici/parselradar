import fs from 'fs';
import path from 'path';

type Check = { name: string; status: 'PASS' | 'FAIL'; detail: string };
type RuntimeFlow = { status?: string; detail?: string };
type RuntimeProof = {
  flows?: {
    ctrlF5Persistence?: RuntimeFlow;
    backForwardPersistence?: RuntimeFlow;
    authMeStorm?: RuntimeFlow;
  };
  runtimeEvidence?: {
    authMe?: { total?: number; status401?: number; errorCode?: string };
  };
};

const ROOT = process.cwd();
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');
const outJson = path.join(ROOT, 'proof', 'browser-history-consistency.json');
const outMd = path.join(ROOT, 'proof', 'browser-history-consistency.md');

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function push(checks: Check[], name: string, pass: boolean, detail: string) {
  checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

function main() {
  const checks: Check[] = [];

  const shell = readText('apps/web/src/components/AppShell.tsx');
  const app = readText('apps/web/src/App.tsx');

  push(checks, 'Shell keeps nav mounted during auth boot states', shell.includes('shellVisible') && shell.includes("authState === 'booting'"), 'History navigation should not collapse shell while auth settles.');
  push(checks, 'Protected pages are wrapped by RequireAuth', app.includes('<RequireAuth><Dashboard /></RequireAuth>') && app.includes('<RequireAuth><PropertyDocuments /></RequireAuth>'), 'History transitions should be guarded centrally.');

  if (!fs.existsSync(runtimePath)) {
    push(checks, 'Runtime history proof exists', false, 'Missing proof/live-browser-mvp-runtime.json');
  } else {
    const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as RuntimeProof;
    const ctrlF5 = String(runtime.flows?.ctrlF5Persistence?.status || '').toUpperCase() === 'PASS';
    const backForward = String(runtime.flows?.backForwardPersistence?.status || '').toUpperCase() === 'PASS';
    const stormBounded = String(runtime.flows?.authMeStorm?.status || '').toUpperCase() === 'PASS';
    const status401 = Number(runtime.runtimeEvidence?.authMe?.status401 || 0);

    push(checks, 'Runtime CTRL+F5 consistency', ctrlF5, runtime.flows?.ctrlF5Persistence?.detail || 'ctrl+f5 flow unavailable');
    push(checks, 'Runtime browser back/forward consistency', backForward, runtime.flows?.backForwardPersistence?.detail || 'back/forward flow unavailable');
    push(checks, 'Runtime auth/me stability under history actions', stormBounded && status401 === 0, `authMe status401=${status401}`);
  }

  const failed = checks.filter((c) => c.status === 'FAIL');
  const result = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  const md = [
    '# Browser History Consistency',
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

  const output = { overallStatus: result.overallStatus, step: 'verify:browser-history', proof: 'proof/browser-history-consistency.json' };
  if (result.overallStatus !== 'PASS') {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(output, null, 2));
}

main();
