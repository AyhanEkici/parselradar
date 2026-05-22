import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'CONFIG_REQUIRED';

type Check = {
  name: string;
  pass: boolean;
  detail: string;
};

const ROOT = process.cwd();
const PROOF_JSON = path.join(ROOT, 'proof', 'p2-4b-database-backup-readiness.json');
const PROOF_MD = path.join(ROOT, 'proof', 'p2-4b-database-backup-readiness.md');

function read(relPath: string): string {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

function hasAll(text: string, tokens: string[]): { ok: boolean; missing: string[] } {
  const missing = tokens.filter((t) => !text.toLowerCase().includes(t.toLowerCase()));
  return { ok: missing.length === 0, missing };
}

function ensureProofDir() {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
}

function main() {
  const policyPath = 'docs/DATABASE_BACKUP_RPO_RTO_POLICY.md';
  const runbookPath = 'docs/DATABASE_BACKUP_RESTORE_RUNBOOK.md';
  const policyText = read(policyPath);
  const runbookText = read(runbookPath);

  const checks: Check[] = [];

  checks.push({
    name: 'Policy file exists',
    pass: policyText.length > 0,
    detail: policyText.length > 0 ? policyPath : `Missing ${policyPath}`,
  });

  checks.push({
    name: 'Runbook file exists',
    pass: runbookText.length > 0,
    detail: runbookText.length > 0 ? runbookPath : `Missing ${runbookPath}`,
  });

  const policyTokens = [
    'Backup owner',
    'RPO target',
    'RTO target',
    'Backup Frequency',
    'Retention',
    'Storage Location Model',
    'Restore Responsibility',
    'Restore Approval Path',
    'Restore Drill Cadence',
    'Minimum Restore Evidence',
    'Emergency Restore Steps',
    'Rollback Strategy',
  ];

  const policyFields = hasAll(policyText, policyTokens);
  checks.push({
    name: 'Policy contains required RPO/RTO ownership fields',
    pass: policyFields.ok,
    detail: policyFields.ok ? 'All required policy sections present.' : `Missing: ${policyFields.missing.join(', ')}`,
  });

  const runbookTokens = ['Procedure', 'Validation Checklist', 'Rollback', 'Drill'];
  const runbookFields = hasAll(runbookText, runbookTokens);
  checks.push({
    name: 'Runbook contains restore procedure/validation/rollback/drill',
    pass: runbookFields.ok,
    detail: runbookFields.ok ? 'Runbook structure complete.' : `Missing: ${runbookFields.missing.join(', ')}`,
  });

  const allPass = checks.every((c) => c.pass);
  const overallStatus: Status = allPass ? 'PASS' : 'FAIL';

  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    step: 'verify:database-backup-readiness',
    staticOnly: true,
    configMutation: false,
    checks,
  };

  ensureProofDir();
  fs.writeFileSync(PROOF_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [
    '# P2.4B Database Backup Readiness',
    '',
    `- overallStatus: ${overallStatus}`,
    `- staticOnly: true`,
    '',
    '## Checks',
    ...checks.map((c) => `- ${c.name}: ${c.pass ? 'PASS' : 'FAIL'} (${c.detail})`),
  ].join('\n');

  fs.writeFileSync(PROOF_MD, `${md}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus, step: 'verify:database-backup-readiness', proof: 'proof/p2-4b-database-backup-readiness.json' }, null, 2));
}

main();
