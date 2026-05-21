import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofPath = path.join(ROOT, 'proof', 'route-wiring-audit.json');

function fail(reason: string, detail?: Record<string, unknown>): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:route-wiring', reason, detail: detail || null }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(proofPath)) {
  fail('missing_proof_file', { expected: 'proof/route-wiring-audit.json' });
}

const payload = JSON.parse(fs.readFileSync(proofPath, 'utf8')) as {
  overallStatus?: string;
  summary?: { broken?: number; disconnected?: number; looping?: number; staleState?: number; fail?: number };
};

const overall = String(payload.overallStatus || '').toUpperCase();
const broken = Number(payload.summary?.broken || 0);
const disconnected = Number(payload.summary?.disconnected || 0);
const looping = Number(payload.summary?.looping || 0);
const staleState = Number(payload.summary?.staleState || 0);
const failCount = Number(payload.summary?.fail || 0);

if (overall !== 'PASS' || broken > 0 || disconnected > 0 || looping > 0 || staleState > 0 || failCount > 0) {
  fail('route_wiring_not_stable', { overallStatus: payload.overallStatus, summary: payload.summary || null, proof: 'proof/route-wiring-audit.json' });
}

console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:route-wiring', proof: 'proof/route-wiring-audit.json' }, null, 2));
