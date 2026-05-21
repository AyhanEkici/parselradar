import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofPath = path.join(ROOT, 'proof', 'platform-integrity-audit.json');

function fail(reason: string, detail?: Record<string, unknown>): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:platform-integrity', reason, detail: detail || null }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(proofPath)) {
  fail('missing_proof_file', { expected: 'proof/platform-integrity-audit.json' });
}

const payload = JSON.parse(fs.readFileSync(proofPath, 'utf8')) as {
  overallStatus?: string;
  summary?: { fail?: number; blockers?: number };
};

const overall = String(payload.overallStatus || '').toUpperCase();
const failCount = Number(payload.summary?.fail || 0);
const blockers = Number(payload.summary?.blockers || 0);

if (overall !== 'PASS' || failCount > 0 || blockers > 0) {
  fail('platform_integrity_not_stable', { overallStatus: payload.overallStatus, summary: payload.summary || null, proof: 'proof/platform-integrity-audit.json' });
}

console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:platform-integrity', proof: 'proof/platform-integrity-audit.json' }, null, 2));
