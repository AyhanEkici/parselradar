import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();

const files = {
  auth: path.join(ROOT, 'apps/api/src/controllers/authController.ts'),
  reports: path.join(ROOT, 'apps/api/src/controllers/reportController.ts'),
  org: path.join(ROOT, 'apps/api/src/controllers/organizationController.ts'),
  telemetry: path.join(ROOT, 'apps/api/src/middleware/operationalTelemetry.ts'),
  connector: path.join(ROOT, 'apps/api/src/controllers/connectorActivationController.ts'),
};

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const auth = read(files.auth);
  const reports = read(files.reports);
  const org = read(files.org);
  const telemetry = read(files.telemetry);
  const connector = read(files.connector);

  const checks: Check[] = [
    check('failed login audited', auth.includes('auth_login_failed'), 'Auth controller should audit login failures.'),
    check('report purchase audited', reports.includes('report_purchase_completed') && reports.includes('report_purchase_failed'), 'Report purchases should be audited.'),
    check('organization mutation audited', org.includes('organization_created') && org.includes('organization_member_updated') && org.includes('organization_member_deleted'), 'Organization mutations should be audited.'),
    check('retry events audited', telemetry.includes('client_request_retried'), 'Retry events should be audited.'),
    check('connector actions audited', connector.includes('connector_source_approval_updated'), 'Connector lifecycle actions should be auditable.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:operational-audit-trail',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/operational-audit-trail.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/operational-audit-trail.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
