import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function main() {
  const mapPage = read('apps/web/src/pages/MapWorkspace.tsx');
  const reportsPage = read('apps/web/src/pages/Reports.tsx');
  const portfolioPage = read('apps/web/src/pages/PortfolioDashboard.tsx');
  const organizationsPage = read('apps/web/src/pages/Organizations.tsx');
  const organizationsController = read('apps/api/src/controllers/organizationController.ts');

  const checks: Check[] = [
    { name: 'analysis overlays linked from reports', pass: mapPage.includes('reportByProperty') && mapPage.includes('analysisId'), detail: 'Map overlays should link report analysis IDs to parcel overlays.' },
    { name: 'reports page links to analysis map route', pass: reportsPage.includes('/map/analysis/${r.analysisRunId}') || reportsPage.includes('to={`/map/analysis/${r.analysisRunId}`}'), detail: 'Reports should deep-link to map analysis route.' },
    { name: 'portfolio overlays linked to map', pass: mapPage.includes('/investor/portfolio') && mapPage.includes('overlayType: \'investment\''), detail: 'Portfolio overlays should be derived from investor portfolio API.' },
    { name: 'portfolio page links to map route', pass: portfolioPage.includes('/map/portfolio'), detail: 'Portfolio page should link to map portfolio route.' },
    { name: 'organization/project overlays use real spatial fields', pass: mapPage.includes('spatialPortfolio') && organizationsController.includes('spatialPortfolio'), detail: 'Organization overlays should use real organization spatial portfolio data.' },
    { name: 'organizations page links to map workspace', pass: organizationsPage.includes('/map'), detail: 'Organizations page should provide map entry point.' },
  ];

  const failed = checks.filter((item) => !item.pass);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'verify:spatial-analysis-linkage',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/spatial-analysis-linkage.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');

  const out = { overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/spatial-analysis-linkage.json' };
  if (proof.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
