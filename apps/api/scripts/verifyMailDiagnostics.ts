import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const adminRoutes = path.join(ROOT, 'apps/api/src/routes/adminRoutes.ts');
const adminController = path.join(ROOT, 'apps/api/src/controllers/adminController.ts');
const page = path.join(ROOT, 'apps/web/src/pages/AdminMailDiagnostics.tsx');
const panel = path.join(ROOT, 'apps/web/src/components/MailDiagnosticsPanel.tsx');
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
    check('mail diagnostics route exists', routes.includes("router.get('/mail-diagnostics'"), 'API route /admin/mail-diagnostics is required.'),
    check('mail test route exists', routes.includes("router.post('/mail-diagnostics/test-email'"), 'API route /admin/mail-diagnostics/test-email is required.'),
    check('mail diagnostics controller exists', controller.includes('getAdminMailDiagnostics') && controller.includes('postAdminMailTestEmail'), 'Controller handlers should exist.'),
    check('mail diagnostics page exists', pageText.includes('/admin/mail-diagnostics') && pageText.includes('/admin/mail-diagnostics/test-email'), 'Frontend page should wire diagnostics and test email endpoint.'),
    check('mail diagnostics panel exists', panelText.includes('Mail Diagnostics'), 'Mail diagnostics panel should exist.'),
    check('admin route added', app.includes('/admin/mail-diagnostics'), 'App route for mail diagnostics should exist.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:mail-diagnostics',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/mail-diagnostics-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/mail-diagnostics-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
