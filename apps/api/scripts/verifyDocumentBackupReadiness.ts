import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'CONFIG_REQUIRED';

type Check = {
  name: string;
  pass: boolean;
  detail: string;
};

const ROOT = process.cwd();
const PROOF_JSON = path.join(ROOT, 'proof', 'p2-4b-document-backup-readiness.json');
const PROOF_MD = path.join(ROOT, 'proof', 'p2-4b-document-backup-readiness.md');

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
  const runbookPath = 'docs/DOCUMENT_FILE_BACKUP_RESTORE_RUNBOOK.md';
  const policyPath = 'docs/EVIDENCE_FILE_RETENTION_AND_DELETION_POLICY.md';
  const runbookText = read(runbookPath);
  const policyText = read(policyPath);

  const checks: Check[] = [];

  checks.push({
    name: 'Document backup runbook exists',
    pass: runbookText.length > 0,
    detail: runbookText.length > 0 ? runbookPath : `Missing ${runbookPath}`,
  });

  checks.push({
    name: 'Evidence retention/deletion policy exists',
    pass: policyText.length > 0,
    detail: policyText.length > 0 ? policyPath : `Missing ${policyPath}`,
  });

  const runbookTokens = [
    'backup owner',
    'backup frequency',
    'retention',
    'restore path',
    'restore drill',
    'integrity',
    'admin deletion audit',
    'sensitive data',
    'token',
    'T.C. Kimlik',
    'e-devlet',
    'supporting evidence',
  ];

  const runbookFields = hasAll(runbookText, runbookTokens);
  checks.push({
    name: 'Runbook contains required backup/restore/sensitive-data controls',
    pass: runbookFields.ok,
    detail: runbookFields.ok ? 'All required controls documented.' : `Missing: ${runbookFields.missing.join(', ')}`,
  });

  const policyTokens = ['retention', 'deletion', 'sensitive data', 'audit', 'supporting evidence'];
  const policyFields = hasAll(policyText, policyTokens);
  checks.push({
    name: 'Policy contains retention/deletion and sensitive evidence controls',
    pass: policyFields.ok,
    detail: policyFields.ok ? 'Policy sections complete.' : `Missing: ${policyFields.missing.join(', ')}`,
  });

  const allPass = checks.every((c) => c.pass);
  const overallStatus: Status = allPass ? 'PASS' : 'FAIL';

  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    step: 'verify:document-backup-readiness',
    staticOnly: true,
    configMutation: false,
    checks,
  };

  ensureProofDir();
  fs.writeFileSync(PROOF_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [
    '# P2.4B Document Backup Readiness',
    '',
    `- overallStatus: ${overallStatus}`,
    `- staticOnly: true`,
    '',
    '## Checks',
    ...checks.map((c) => `- ${c.name}: ${c.pass ? 'PASS' : 'FAIL'} (${c.detail})`),
  ].join('\n');

  fs.writeFileSync(PROOF_MD, `${md}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus, step: 'verify:document-backup-readiness', proof: 'proof/p2-4b-document-backup-readiness.json' }, null, 2));
}

main();
