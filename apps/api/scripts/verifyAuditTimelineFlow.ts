import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/AdminAuditTimeline.tsx');
const ROUTE = path.join(ROOT, 'apps/api/src/routes/auditRoutes.ts');
const PROOF = path.join(ROOT, 'proof/audit-timeline-flow-audit.json');

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
    check('audit events api wired', page.includes('/admin/audit-events?'), 'Audit timeline must load from backend.'),
    check('loading state present', page.includes('Loading...'), 'Loading state is required.'),
    check('empty state present', page.includes('Audit kaydı bulunamadı'), 'Empty state is required.'),
    check('error state present', page.includes('Audit verileri alınamadı') && page.includes('Hata:'), 'Error state is required.'),
    check('pagination controls present', page.includes('Prev') && page.includes('Next') && page.includes('totalPages'), 'Timeline should support pagination.'),
    check('backend route exists', route.includes("router.get('/admin/audit-events', auth, admin, getAuditEvents)"), 'Audit route must exist.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:audit-timeline-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/audit-timeline-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();