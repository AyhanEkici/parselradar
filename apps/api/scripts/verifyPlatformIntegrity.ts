import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofPath = path.join(ROOT, 'proof', 'platform-integrity-audit.json');
const SOURCES = [
  { key: 'deploymentTruth', file: 'proof/deployment-truth-proof-bundle.json' },
  { key: 'authShell', file: 'proof/auth-shell-consistency.json' },
  { key: 'navigationPersistence', file: 'proof/navigation-persistence.json' },
  { key: 'protectedRoutes', file: 'proof/protected-route-integrity.json' },
  { key: 'browserHistory', file: 'proof/browser-history-consistency.json' },
  { key: 'liveBrowserMvp', file: 'proof/live-browser-mvp-runtime.json' },
  { key: 'routeWiring', file: 'proof/route-wiring-audit.json' },
  { key: 'rbac', file: 'proof/rbac-proof-bundle.json' },
  { key: 'platform', file: 'proof/platform-proof-bundle.json' },
];

function fail(reason: string, detail?: Record<string, unknown>): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:platform-integrity', reason, detail: detail || null }, null, 2));
  process.exit(1);
}

const areas: Record<string, { status: string; detail: string }> = {};
let failCount = 0;
let blockers = 0;

for (const source of SOURCES) {
  const absolute = path.join(ROOT, source.file);
  if (!fs.existsSync(absolute)) {
    areas[source.key] = { status: 'BLOCKED', detail: `Missing ${source.file}` };
    blockers += 1;
    continue;
  }

  const payload = JSON.parse(fs.readFileSync(absolute, 'utf8')) as { overallStatus?: string; summary?: Record<string, unknown> };
  const status = String(payload.overallStatus || 'FAIL').toUpperCase();
  areas[source.key] = {
    status,
    detail: `${source.file} overallStatus=${status}`,
  };
  if (status === 'FAIL') failCount += 1;
}

const audit = {
  generatedAt: new Date().toISOString(),
  overallStatus: failCount === 0 && blockers === 0 ? 'PASS' : 'FAIL',
  summary: {
    total: SOURCES.length,
    pass: Object.values(areas).filter((item) => item.status === 'PASS' || item.status === 'WARN').length,
    fail: failCount,
    blockers,
  },
  areas,
};

fs.writeFileSync(proofPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

if (audit.overallStatus !== 'PASS') {
  fail('platform_integrity_not_stable', { overallStatus: audit.overallStatus, summary: audit.summary, proof: 'proof/platform-integrity-audit.json' });
}

console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:platform-integrity', proof: 'proof/platform-integrity-audit.json' }, null, 2));
