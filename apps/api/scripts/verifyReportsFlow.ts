import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/Reports.tsx');
const ROUTES = path.join(ROOT, 'apps/api/src/routes/reportRoutes.ts');
const PROOF = path.join(ROOT, 'proof/reports-flow-audit.json');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const page = read(PAGE);
  const routes = read(ROUTES);

  const checks: Check[] = [
    check('reports api list wired', page.includes("apiFetch('reports')"), 'Reports list must be loaded from API.'),
    check('purchase action wired', page.includes("/reports/${report.analysisRunId}/purchase-pdf") && page.includes('handlePurchase'), 'Purchase PDF action should call purchase endpoint.'),
    check('download action wired', page.includes("/reports/${report._id}/download") && page.includes('handleDownload'), 'Download should use authenticated fetch flow.'),
    check('loading state present', page.includes('Raporlar yükleniyor'), 'Page should expose loading state.'),
    check('empty state present', page.includes('Henüz rapor kaydı yok'), 'Page should expose empty state.'),
    check('error state present', page.includes('setError') && page.includes('Raporlar yüklenemedi'), 'Page should expose error state.'),
    check('report routes exist', routes.includes("router.get('/', auth, getReports)") && routes.includes("router.get('/:id/download', auth, downloadReport)"), 'Backend report endpoints must be mounted.'),
    check('no mock marker in page', !/\bmock\b|\bfake\b/i.test(page), 'Reports page should not include mock/fake markers.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:reports-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/reports-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();