import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/AdminAnalyses.tsx');
const ROUTE = path.join(ROOT, 'apps/api/src/routes/adminRoutes.ts');
const PROOF = path.join(ROOT, 'proof/admin-analyses-flow-audit.json');

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
    check('analyses endpoint wired', page.includes('/admin/analyses?') || page.includes('/admin/analyses?${params.toString()}'), 'Admin analyses list must call backend endpoint.'),
    check('filters wired', page.includes('userIdFilter') && page.includes('propertyIdFilter') && page.includes('typeFilter'), 'User/property/type filters should be present.'),
    check('loading state present', page.includes('Yükleniyor...'), 'Loading state is required.'),
    check('empty state present', page.includes('analiz kaydı bulunamadı'), 'Empty state is required.'),
    check('error state present', page.includes('setError') && page.includes('Hata'), 'Error state is required.'),
    check('admin route exists', route.includes("router.get('/analyses', auth, admin, getAdminAnalyses)"), 'Admin analyses backend route should exist.'),
    check('no mock marker', !/\bmock\b|\bfake\b/i.test(page), 'Admin analyses page should avoid mock/fake markers.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:admin-analyses-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/admin-analyses-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();