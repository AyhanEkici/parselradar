import fs from 'fs';
import path from 'path';

type ProofState = { name: string; exists: boolean; status: string };

const ROOT = process.cwd();
const proofDir = path.join(ROOT, 'proof');
const requiredProofs = [
  'observability-audit.json',
  'runtime-health-audit.json',
  'retry-integrity-audit.json',
  'env-integrity-audit.json',
  'mail-diagnostics-audit.json',
  'stripe-diagnostics-audit.json',
  'operational-audit-trail.json',
  'error-boundaries-audit.json',
];

function readStatus(filePath: string) {
  try {
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8')) as any;
    return String(payload?.overallStatus || 'UNKNOWN').toUpperCase();
  } catch {
    return 'UNREADABLE';
  }
}

function main() {
  const states: ProofState[] = requiredProofs.map((name) => {
    const filePath = path.join(proofDir, name);
    const exists = fs.existsSync(filePath);
    return {
      name,
      exists,
      status: exists ? readStatus(filePath) : 'MISSING',
    };
  });

  const passCount = states.filter((item) => item.status === 'PASS').length;
  const hardeningScore = Math.round((passCount / requiredProofs.length) * 100);
  const remainingBlockers = states.filter((item) => item.status !== 'PASS');

  const payload = {
    generatedAt: new Date().toISOString(),
    phase: 'P2.3',
    overallStatus: remainingBlockers.length === 0 ? 'PASS' : 'FAIL',
    hardeningScore,
    operationalIntegrityStatus: remainingBlockers.length === 0 ? 'HARDENED' : 'PARTIAL',
    remainingProductionBlockers: remainingBlockers,
    observabilityCoverage: states.filter((s) => s.name.includes('observability') || s.name.includes('runtime-health')).map((s) => ({ proof: s.name, status: s.status })),
    retryCoverage: states.filter((s) => s.name.includes('retry')).map((s) => ({ proof: s.name, status: s.status })),
    envSafetyStatus: states.find((s) => s.name === 'env-integrity-audit.json')?.status || 'MISSING',
    mailStripeDiagnosticStatus: states.filter((s) => s.name.includes('mail') || s.name.includes('stripe')).map((s) => ({ proof: s.name, status: s.status })),
    proofs: states,
  };

  fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'p2-3-production-hardening.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [
    '# P2.3 Production Hardening',
    '',
    `- hardeningScore: ${payload.hardeningScore}`,
    `- operationalIntegrityStatus: ${payload.operationalIntegrityStatus}`,
    `- overallStatus: ${payload.overallStatus}`,
    '',
    '## Remaining Production Blockers',
    ...(payload.remainingProductionBlockers.length === 0
      ? ['- none']
      : payload.remainingProductionBlockers.map((b) => `- ${b.name}: ${b.status}`)),
    '',
    '## Proofs',
    ...states.map((state) => `- ${state.name}: ${state.status}`),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(proofDir, 'p2-3-production-hardening.md'), md, 'utf8');

  console.log(
    JSON.stringify(
      {
        overallStatus: payload.overallStatus,
        step: 'verify:production-hardening',
        hardeningScore: payload.hardeningScore,
        proofs: ['proof/p2-3-production-hardening.json', 'proof/p2-3-production-hardening.md'],
      },
      null,
      2,
    ),
  );

  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
