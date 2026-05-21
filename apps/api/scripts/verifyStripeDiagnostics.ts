import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const adminRoutes = path.join(ROOT, 'apps/api/src/routes/adminRoutes.ts');
const adminController = path.join(ROOT, 'apps/api/src/controllers/adminController.ts');
const page = path.join(ROOT, 'apps/web/src/pages/AdminStripeDiagnostics.tsx');
const panel = path.join(ROOT, 'apps/web/src/components/StripeDiagnosticsPanel.tsx');
const appRoutes = path.join(ROOT, 'apps/web/src/App.tsx');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const routes = read(adminRoutes);
  const controller = read(adminController);
  const pageText = read(page);
  const panelText = read(panel);
  const app = read(appRoutes);

  const checks: Check[] = [
    check('stripe diagnostics route exists', routes.includes("router.get('/stripe-diagnostics'"), 'API route /admin/stripe-diagnostics is required.'),
    check('stripe diagnostics controller exists', controller.includes('getAdminStripeDiagnostics'), 'Controller handler should exist.'),
    check('stripe diagnostics page exists', pageText.includes('/admin/stripe-diagnostics'), 'Frontend page should call stripe diagnostics endpoint.'),
    check('stripe diagnostics panel exists', panelText.includes('Stripe Diagnostics'), 'Stripe diagnostics panel should exist.'),
    check('admin route added', app.includes('/admin/stripe-diagnostics'), 'App route for stripe diagnostics should exist.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:stripe-diagnostics',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/stripe-diagnostics-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/stripe-diagnostics-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
