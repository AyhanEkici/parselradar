import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/Organizations.tsx');
const ROUTE = path.join(ROOT, 'apps/api/src/routes/organizationRoutes.ts');
const PROOF = path.join(ROOT, 'proof/organizations-flow-audit.json');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const page = read(PAGE);
  const route = read(ROUTE);
  const checks: Check[] = [
    check('organizations list api wired', page.includes("apiFetch('organizations')"), 'Organizations list must call backend.'),
    check('organization create api wired', page.includes("apiFetch('organizations', { method: 'POST'"), 'Create organization action must call backend.'),
    check('loading state present', page.includes('Organizations yükleniyor...'), 'Loading state is required.'),
    check('empty state present', page.includes('No organizations yet'), 'Empty state is required.'),
    check('error state present', page.includes('Organizations yüklenemedi') || page.includes('Organization oluşturulamadı'), 'Error state is required.'),
    check('organization routes exist', route.includes("router.get('/organizations', auth, getOrganizations)") && route.includes("router.post('/organizations', auth, createOrganization)"), 'Core organization routes must exist.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:organizations-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/organizations-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();