import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'apps/web/src/pages/InvestorDashboard.tsx');
const ROUTE = path.join(ROOT, 'apps/api/src/routes/investorRoutes.ts');
const PROOF = path.join(ROOT, 'proof/investor-flow-audit.json');

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
    check('dashboard api wired', page.includes("apiFetch('investor/dashboard')"), 'Investor dashboard must use live API.'),
    check('loading state present', page.includes('Yükleniyor...'), 'Loading state is required.'),
    check('error state present', page.includes('Dashboard yüklenemedi'), 'Error state is required.'),
    check('summary metrics wired', page.includes('summary.') || page.includes('summary?.'), 'Investor metrics should be fed by API summary.'),
    check('investor routes exist', route.includes("router.get('/dashboard', auth, getInvestorDashboard)") && route.includes("router.get('/saved-analyses', auth, getSavedAnalyses)") && route.includes("router.get('/watchlist', auth, getWatchlist)"), 'Core investor API routes must exist.'),
    check('no mock marker', !/\bmock\b|\bfake\b/i.test(page), 'Investor page should not include mock/fake markers.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:investor-flow',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.dirname(PROOF), { recursive: true });
  fs.writeFileSync(PROOF, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/investor-flow-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();