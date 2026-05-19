import fs from 'fs';
import { repoPath } from './platformVerification';
import { verifyAdminAccess } from './verifyAdminAccess';
import { verifyUserIsolation } from './verifyUserIsolation';
import { verifyRouteScoping } from './verifyRouteScoping';

export type RbacCheckStatus = 'PASS' | 'FAIL';

export type RbacProofBundle = {
  generatedAt: string;
  overallStatus: RbacCheckStatus;
  summary: {
    total: number;
    pass: number;
    fail: number;
  };
  checks: Array<{
    id: string;
    status: RbacCheckStatus;
    message: string;
  }>;
  scenarios: string[];
};

function toMarkdown(bundle: RbacProofBundle) {
  const lines: string[] = [];
  lines.push('# RBAC Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Total checks: ${bundle.summary.total}`);
  lines.push(`- PASS: ${bundle.summary.pass}`);
  lines.push(`- FAIL: ${bundle.summary.fail}`);
  lines.push('');
  lines.push('## Checks');
  lines.push('| Status | Check ID | Message |');
  lines.push('| --- | --- | --- |');
  for (const check of bundle.checks) {
    lines.push(`| ${check.status} | ${check.id} | ${check.message.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  lines.push('## Manual Test Scenarios');
  for (const scenario of bundle.scenarios) {
    lines.push(`- ${scenario}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function runRbacVerification() {
  const checks = [...verifyAdminAccess(), ...verifyRouteScoping(), ...verifyUserIsolation()];
  const fail = checks.filter((check) => check.status === 'FAIL').length;

  const bundle: RbacProofBundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: fail > 0 ? 'FAIL' : 'PASS',
    summary: {
      total: checks.length,
      pass: checks.length - fail,
      fail,
    },
    checks,
    scenarios: [
      'Admin login: admin tabs visible; global admin/connector/observability/deployment routes accessible.',
      'Normal user (Mahir): admin menu hidden; /admin/* resolves to access denied; only own properties/reports/portfolios/documents visible.',
      'Another normal user: cannot read Mahir-owned records by list, detail, export, or direct ID route.',
    ],
  };

  fs.writeFileSync(repoPath('proof', 'rbac-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(repoPath('proof', 'rbac-proof-bundle.md'), toMarkdown(bundle), 'utf-8');

  return bundle;
}

export function runRbacVerificationCli() {
  const bundle = runRbacVerification();
  process.stdout.write(
    `verify:rbac | status=${bundle.overallStatus} | total=${bundle.summary.total} | pass=${bundle.summary.pass} | fail=${bundle.summary.fail}\n`
  );
  if (bundle.overallStatus === 'FAIL') process.exit(1);
}
