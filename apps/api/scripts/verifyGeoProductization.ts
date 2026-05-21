import fs from 'fs';
import path from 'path';

type StatusProof = { overallStatus?: string };
const ROOT = process.cwd();

function readProof(relPath: string): StatusProof {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as StatusProof;
}

function status(relPath: string) {
  return String(readProof(relPath).overallStatus || 'FAIL').toUpperCase();
}

function main() {
  const overlayStatus = status('proof/geo-overlay-render-audit.json');
  const groupingStatus = status('proof/layer-grouping-audit.json');
  const viewportStatus = status('proof/viewport-persistence-audit.json');
  const linkageStatus = status('proof/spatial-analysis-linkage.json');
  const diagnosticsStatus = status('proof/map-diagnostics-audit.json');
  const uxStatus = status('proof/geo-ux-integrity-audit.json');

  const checks = [
    { name: 'overlay integrity', status: overlayStatus, proof: 'proof/geo-overlay-render-audit.json' },
    { name: 'layer grouping', status: groupingStatus, proof: 'proof/layer-grouping-audit.json' },
    { name: 'viewport persistence', status: viewportStatus, proof: 'proof/viewport-persistence-audit.json' },
    { name: 'analysis linkage', status: linkageStatus, proof: 'proof/spatial-analysis-linkage.json' },
    { name: 'diagnostics', status: diagnosticsStatus, proof: 'proof/map-diagnostics-audit.json' },
    { name: 'geo ux integrity', status: uxStatus, proof: 'proof/geo-ux-integrity-audit.json' },
  ];

  const remainingGeoBlockers = checks.filter((item) => item.status !== 'PASS').map((item) => `${item.name} is ${item.status}`);

  const payload = {
    generatedAt: new Date().toISOString(),
    phase: 'P3.3',
    step: 'verify:geo-productization',
    overallStatus: remainingGeoBlockers.length === 0 ? 'PASS' : 'FAIL',
    geoUxStatus: uxStatus,
    overlayIntegrityStatus: overlayStatus,
    diagnosticsStatus,
    analysisLinkageStatus: linkageStatus,
    remainingGeoBlockers,
    checks,
    proofs: [
      'proof/p3-3-geo-productization.json',
      'proof/p3-3-geo-productization.md',
      'proof/geo-overlay-render-audit.json',
      'proof/layer-grouping-audit.json',
      'proof/viewport-persistence-audit.json',
      'proof/spatial-analysis-linkage.json',
      'proof/map-diagnostics-audit.json',
    ],
  };

  const markdown = [
    '# P3.3 Geo Productization',
    '',
    `Overall status: ${payload.overallStatus}`,
    '',
    `- geo UX status: ${payload.geoUxStatus}`,
    `- overlay integrity status: ${payload.overlayIntegrityStatus}`,
    `- diagnostics status: ${payload.diagnosticsStatus}`,
    `- analysis linkage status: ${payload.analysisLinkageStatus}`,
    '',
    '## Remaining geo blockers',
    ...(payload.remainingGeoBlockers.length === 0 ? ['- none'] : payload.remainingGeoBlockers.map((item) => `- ${item}`)),
    '',
  ].join('\n');

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/p3-3-geo-productization.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'proof/p3-3-geo-productization.md'), `${markdown}\n`, 'utf8');

  const out = { overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/p3-3-geo-productization.json' };
  if (payload.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
