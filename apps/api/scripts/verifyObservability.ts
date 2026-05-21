import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();
const observabilityPage = path.join(ROOT, 'apps/web/src/pages/AdminObservability.tsx');
const runtimeHealthPage = path.join(ROOT, 'apps/web/src/pages/AdminRuntimeHealth.tsx');
const appRoutes = path.join(ROOT, 'apps/web/src/App.tsx');
const adminRoutes = path.join(ROOT, 'apps/api/src/routes/adminRoutes.ts');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function writeProof(fileName: string, payload: any) {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof', fileName), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function main() {
  const obs = read(observabilityPage);
  const runtime = read(runtimeHealthPage);
  const app = read(appRoutes);
  const routes = read(adminRoutes);

  const observabilityChecks: Check[] = [
    check('observability dashboard component used', obs.includes('ObservabilityDashboard'), 'Admin observability page should render ObservabilityDashboard.'),
    check('observability summary endpoint wired', obs.includes("/admin/observability-summary"), 'Observability page should fetch summary endpoint.'),
    check('runtime health route added', app.includes('/admin/runtime-health'), 'App routes must include /admin/runtime-health.'),
    check('runtime health api route added', routes.includes("router.get('/runtime-health'"), 'API routes must include /admin/runtime-health endpoint.'),
  ];

  const runtimeChecks: Check[] = [
    check('runtime health panel used', runtime.includes('RuntimeHealthPanel'), 'Runtime health page should render RuntimeHealthPanel.'),
    check('runtime health fetch endpoint', runtime.includes("/admin/runtime-health"), 'Runtime health page should fetch endpoint.'),
    check('runtime health retry action', runtime.includes('Retry'), 'Runtime health page should expose retry action.'),
  ];

  const observabilityFailed = observabilityChecks.filter((c) => !c.pass);
  const runtimeFailed = runtimeChecks.filter((c) => !c.pass);

  const observabilityPayload = {
    generatedAt: new Date().toISOString(),
    overallStatus: observabilityFailed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:observability',
    summary: { total: observabilityChecks.length, pass: observabilityChecks.length - observabilityFailed.length, fail: observabilityFailed.length },
    checks: observabilityChecks,
  };

  const runtimePayload = {
    generatedAt: new Date().toISOString(),
    overallStatus: runtimeFailed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:runtime-health',
    summary: { total: runtimeChecks.length, pass: runtimeChecks.length - runtimeFailed.length, fail: runtimeFailed.length },
    checks: runtimeChecks,
  };

  writeProof('observability-audit.json', observabilityPayload);
  writeProof('runtime-health-audit.json', runtimePayload);

  const overallStatus = observabilityFailed.length === 0 && runtimeFailed.length === 0 ? 'PASS' : 'FAIL';
  console.log(JSON.stringify({ overallStatus, step: 'verify:observability', proofs: ['proof/observability-audit.json', 'proof/runtime-health-audit.json'] }, null, 2));
  if (overallStatus !== 'PASS') process.exit(1);
}

main();
