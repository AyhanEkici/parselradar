import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/AdminProperties.tsx');
const ROUTE = path.join(ROOT, 'apps/api/src/routes/adminRoutes.ts');
const PROOF = path.join(ROOT, 'proof/property-inventory-flow-audit.json');

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
    check('properties api wired', page.includes("apiFetch('/admin/properties')"), 'Admin properties list must call backend.'),
    check('status filtering present', page.includes('statusFilter') && page.includes('Tüm Durumlar'), 'Status filter should exist.'),
    check('analysis linkage present', page.includes('/admin/analyses?propertyId='), 'Property rows should link to filtered analyses.'),
    check('loading state present', page.includes('Mülkler yükleniyor...'), 'Loading state is required.'),
    check('empty state present', page.includes('Görüntülenecek mülk bulunamadı'), 'Empty state is required.'),
    check('error state present', page.includes('Mülkler yüklenemedi'), 'Error state is required.'),
    check('backend routes exist', route.includes("router.get('/properties', auth, admin, getAllProperties)") && route.includes("router.get('/properties/:id', auth, admin, getPropertyById)"), 'Property inventory routes must exist.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:property-inventory-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/property-inventory-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();