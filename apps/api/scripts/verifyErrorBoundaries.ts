import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();
const APP = path.join(ROOT, 'apps/web/src/App.tsx');
const BOUNDARY = path.join(ROOT, 'apps/web/src/components/ErrorBoundary.tsx');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const app = read(APP);
  const boundary = read(BOUNDARY);

  const checks: Check[] = [
    check('error boundary component exists', boundary.includes('class ErrorBoundary'), 'ErrorBoundary class component should exist.'),
    check('route wrapper exists', app.includes('withBoundary('), 'Routes should use withBoundary helper.'),
    check('dashboard protected by boundary', app.includes("withBoundary('/dashboard'"), 'Dashboard route should be wrapped.'),
    check('reports protected by boundary', app.includes("withBoundary('/reports'"), 'Reports route should be wrapped.'),
    check('admin analyses protected by boundary', app.includes("withBoundary('/admin/analyses'"), 'Admin analyses route should be wrapped.'),
    check('investor protected by boundary', app.includes("withBoundary('/investor'"), 'Investor route should be wrapped.'),
    check('organizations protected by boundary', app.includes("withBoundary('/organizations'"), 'Organizations route should be wrapped.'),
    check('recover actions present', boundary.includes('Tekrar dene') && boundary.includes('Sayfayi yenile'), 'Boundary fallback should support recover + reload.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:error-boundaries',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/error-boundaries-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/error-boundaries-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
