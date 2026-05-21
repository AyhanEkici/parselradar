import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofDir = path.join(ROOT, 'proof');

const required = [
  'tucbs-capabilities-audit.json',
  'ogc-layer-catalog.json',
  'connector-diagnostics-audit.json',
  'map-overlay-integrity.json',
  'read-only-geo-mode-audit.json',
  'layer-catalog-audit.json',
];

function readStatus(filePath: string): string {
  try {
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8')) as any;
    return String(payload?.overallStatus || 'UNKNOWN').toUpperCase();
  } catch {
    return 'UNREADABLE';
  }
}

function main() {
  const proofs = required.map((name) => {
    const filePath = path.join(proofDir, name);
    const exists = fs.existsSync(filePath);
    return {
      name,
      exists,
      status: exists ? readStatus(filePath) : 'MISSING',
    };
  });

  const blockers = proofs.filter((proof) => proof.status !== 'PASS');

  const payload = {
    generatedAt: new Date().toISOString(),
    phase: 'P3',
    overallStatus: blockers.length === 0 ? 'PASS' : 'FAIL',
    connectorStatus: proofs.find((proof) => proof.name === 'tucbs-capabilities-audit.json')?.status || 'MISSING',
    layerCatalogStatus: proofs.find((proof) => proof.name === 'ogc-layer-catalog.json')?.status || 'MISSING',
    diagnosticsStatus: proofs.find((proof) => proof.name === 'connector-diagnostics-audit.json')?.status || 'MISSING',
    mapOverlayIntegrity: proofs.find((proof) => proof.name === 'map-overlay-integrity.json')?.status || 'MISSING',
    remainingGisBlockers: blockers,
    proofs,
  };

  fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'p3-external-intelligence-foundation.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [
    '# P3 External Intelligence Foundation',
    '',
    `- connectorStatus: ${payload.connectorStatus}`,
    `- layerCatalogStatus: ${payload.layerCatalogStatus}`,
    `- diagnosticsStatus: ${payload.diagnosticsStatus}`,
    `- mapOverlayIntegrity: ${payload.mapOverlayIntegrity}`,
    '',
    '## Remaining GIS Blockers',
    ...(payload.remainingGisBlockers.length === 0 ? ['- none'] : payload.remainingGisBlockers.map((item) => `- ${item.name}: ${item.status}`)),
    '',
    '## Proofs',
    ...proofs.map((item) => `- ${item.name}: ${item.status}`),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(proofDir, 'p3-external-intelligence-foundation.md'), md, 'utf8');

  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: 'verify:external-intelligence-foundation', proofs: ['proof/p3-external-intelligence-foundation.json', 'proof/p3-external-intelligence-foundation.md'] }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
