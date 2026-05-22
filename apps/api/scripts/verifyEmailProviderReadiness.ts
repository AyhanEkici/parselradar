import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'CONFIG_REQUIRED';

type Check = {
  name: string;
  pass: boolean;
  detail: string;
};

const ROOT = process.cwd();
const PROOF_JSON = path.join(ROOT, 'proof', 'p2-4b-email-provider-readiness.json');
const PROOF_MD = path.join(ROOT, 'proof', 'p2-4b-email-provider-readiness.md');

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

function findPotentialSecrets(): string[] {
  const files = [
    'docs/SMTP_EMAIL_PROVIDER_LAUNCH_GATE.md',
    'docs/EMAIL_DELIVERABILITY_AND_OPERATIONAL_POLICY.md',
  ];
  const hits: string[] = [];
  const secretLike = /(smtp_pass\s*[:=]\s*[^\s#]+|smtp user\s*[:=]\s*[^\s#]+|password\s*[:=]\s*[^\s#]+|api[_-]?key\s*[:=]\s*[^\s#]+)/i;
  for (const relPath of files) {
    const text = read(relPath);
    if (!text) continue;
    if (secretLike.test(text)) hits.push(relPath);
  }
  return hits;
}

function main() {
  const gatePath = 'docs/SMTP_EMAIL_PROVIDER_LAUNCH_GATE.md';
  const policyPath = 'docs/EMAIL_DELIVERABILITY_AND_OPERATIONAL_POLICY.md';
  const gateText = read(gatePath);
  const policyText = read(policyPath);

  const checks: Check[] = [];

  checks.push({
    name: 'SMTP launch gate doc exists',
    pass: gateText.length > 0,
    detail: gateText.length > 0 ? gatePath : `Missing ${gatePath}`,
  });

  checks.push({
    name: 'Email deliverability policy doc exists',
    pass: policyText.length > 0,
    detail: policyText.length > 0 ? policyPath : `Missing ${policyPath}`,
  });

  const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'SMTP_SECURE',
    'NOTIFY_SMTP_HOST',
    'NOTIFY_SMTP_PORT',
    'NOTIFY_SMTP_USER',
    'NOTIFY_SMTP_PASS',
    'NOTIFY_EMAIL_FROM',
  ];

  const envFields = hasAll(gateText, requiredEnv);
  checks.push({
    name: 'Required SMTP env variable names documented',
    pass: envFields.ok,
    detail: envFields.ok ? 'All required env names present.' : `Missing: ${envFields.missing.join(', ')}`,
  });

  const gateFields = hasAll(gateText, [
    'Selected provider',
    'sender',
    'reply-to',
    'SPF',
    'DKIM',
    'DMARC',
    'test mode',
    'production mode',
    'bounce',
    'complaint',
    'rate limit',
    'login/security',
    'payment/credit',
    'report-ready',
    'admin notification',
    'support/contact',
    'Launch Gate Criteria',
  ]);
  checks.push({
    name: 'Launch gate includes provider placeholder and deliverability checklist',
    pass: gateFields.ok,
    detail: gateFields.ok ? 'Launch gate checklist complete.' : `Missing: ${gateFields.missing.join(', ')}`,
  });

  const secretHits = findPotentialSecrets();
  checks.push({
    name: 'No real secrets documented in new email docs',
    pass: secretHits.length === 0,
    detail: secretHits.length === 0 ? 'No secret-like literals detected.' : `Potential secret-like content in: ${secretHits.join(', ')}`,
  });

  const runtimeConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM
  );

  checks.push({
    name: 'Runtime SMTP env currently configured for launch',
    pass: runtimeConfigured,
    detail: runtimeConfigured
      ? 'SMTP runtime variables are present in current environment.'
      : 'CONFIG_REQUIRED: SMTP runtime variables are not fully present in current environment.',
  });

  const structuralPass = checks.slice(0, 5).every((c) => c.pass);
  let overallStatus: Status;
  if (!structuralPass) {
    overallStatus = 'FAIL';
  } else if (!runtimeConfigured) {
    overallStatus = 'CONFIG_REQUIRED';
  } else {
    overallStatus = 'PASS';
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    step: 'verify:email-provider-readiness',
    staticOnly: true,
    configMutation: false,
    checks,
  };

  ensureProofDir();
  fs.writeFileSync(PROOF_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [
    '# P2.4B Email Provider Readiness',
    '',
    `- overallStatus: ${overallStatus}`,
    `- staticOnly: true`,
    '',
    '## Checks',
    ...checks.map((c) => `- ${c.name}: ${c.pass ? 'PASS' : 'FAIL'} (${c.detail})`),
  ].join('\n');

  fs.writeFileSync(PROOF_MD, `${md}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus, step: 'verify:email-provider-readiness', proof: 'proof/p2-4b-email-provider-readiness.json' }, null, 2));
}

main();
