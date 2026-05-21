import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

type ClosureSummary = {
  generatedAt: string;
  overallStatus: 'PASS' | 'FAIL';
  checks: Array<{ name: string; pass: boolean; detail: string }>;
  remainingTargets: Array<{ route: string; status: string; issue: string }>;
  proofInputs: Record<string, string>;
};

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addCheck(checks: ClosureSummary['checks'], name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
}

function main() {
  const files = {
    routeMap: path.join(ROOT, 'proof/mvp-route-action-map.json'),
    completeness: path.join(ROOT, 'proof/mvp-functional-completeness-audit.json'),
    reports: path.join(ROOT, 'proof/reports-flow-audit.json'),
    adminAnalyses: path.join(ROOT, 'proof/admin-analyses-flow-audit.json'),
    investor: path.join(ROOT, 'proof/investor-flow-audit.json'),
    organizations: path.join(ROOT, 'proof/organizations-flow-audit.json'),
    inventory: path.join(ROOT, 'proof/property-inventory-flow-audit.json'),
    auditTimeline: path.join(ROOT, 'proof/audit-timeline-flow-audit.json'),
  };

  const checks: ClosureSummary['checks'] = [];
  for (const [key, file] of Object.entries(files)) {
    addCheck(checks, `proof exists: ${key}`, fs.existsSync(file), file);
  }

  const missing = checks.filter((c) => !c.pass);
  if (missing.length > 0) {
    const payload: ClosureSummary = {
      generatedAt: new Date().toISOString(),
      overallStatus: 'FAIL',
      checks,
      remainingTargets: [],
      proofInputs: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, path.relative(ROOT, v).replace(/\\/g, '/')])),
    };
    fs.writeFileSync(path.join(ROOT, 'proof/mvp-blocker-closure-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:mvp-blocker-closure', proof: 'proof/mvp-blocker-closure-audit.json' }, null, 2));
    process.exit(1);
  }

  const routeMap = readJson(files.routeMap);
  const completeness = readJson(files.completeness);
  const flowProofs = [
    readJson(files.reports),
    readJson(files.adminAnalyses),
    readJson(files.investor),
    readJson(files.organizations),
    readJson(files.inventory),
    readJson(files.auditTimeline),
  ];

  const targetRoutes = new Set([
    '/reports',
    '/admin/analyses',
    '/investor',
    '/admin/users',
    '/admin/properties',
    '/admin/audit-timeline',
    '/organizations',
    '/investor/portfolio',
  ]);

  const rows = Array.isArray(routeMap?.rows) ? routeMap.rows : [];
  const remainingTargets = rows
    .filter((row: any) => targetRoutes.has(row.route) && row.currentStatus !== 'COMPLETE')
    .map((row: any) => ({ route: row.route, status: row.currentStatus, issue: row.issue }));

  addCheck(checks, 'target routes complete', remainingTargets.length === 0, `remaining=${remainingTargets.length}`);
  addCheck(
    checks,
    'flow verifiers pass',
    flowProofs.every((proof: any) => String(proof?.overallStatus || '').toUpperCase() === 'PASS'),
    flowProofs.map((proof: any) => `${proof.step}:${proof.overallStatus}`).join(', ')
  );
  addCheck(
    checks,
    'completeness score improved',
    Number(completeness?.completenessScore || 0) >= 45,
    `score=${completeness?.completenessScore ?? 0} target>=45`
  );

  const failed = checks.filter((c) => !c.pass);
  const payload: ClosureSummary = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    checks,
    remainingTargets,
    proofInputs: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, path.relative(ROOT, v).replace(/\\/g, '/')])),
  };

  const out = path.join(ROOT, 'proof/mvp-blocker-closure-audit.json');
  fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: 'verify:mvp-blocker-closure', proof: 'proof/mvp-blocker-closure-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();