import fs from 'fs';
import path from 'path';

type StatusProof = { overallStatus?: string };
const ROOT = process.cwd();

function readProof(relPath: string): StatusProof {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as StatusProof;
}

function pass(relPath: string) {
  return String(readProof(relPath).overallStatus || '').toUpperCase() === 'PASS';
}

function main() {
  const checks = [
    { name: 'geo overlay rendering', pass: pass('proof/geo-overlay-render-audit.json'), proof: 'proof/geo-overlay-render-audit.json' },
    { name: 'layer grouping', pass: pass('proof/layer-grouping-audit.json'), proof: 'proof/layer-grouping-audit.json' },
    { name: 'viewport persistence', pass: pass('proof/viewport-persistence-audit.json'), proof: 'proof/viewport-persistence-audit.json' },
    { name: 'spatial analysis linkage', pass: pass('proof/spatial-analysis-linkage.json'), proof: 'proof/spatial-analysis-linkage.json' },
    { name: 'map diagnostics', pass: pass('proof/map-diagnostics-audit.json'), proof: 'proof/map-diagnostics-audit.json' },
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:geo-ux-integrity',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/geo-ux-integrity-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const out = { overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/geo-ux-integrity-audit.json' };
  if (payload.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
