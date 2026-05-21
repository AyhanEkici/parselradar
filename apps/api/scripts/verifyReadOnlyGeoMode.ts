import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function read(file: string) {
  return fs.readFileSync(file, 'utf8').toLowerCase();
}

function main() {
  const tucbsConnector = read(path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsConnector.ts'));
  const controller = read(path.join(ROOT, 'apps/api/src/controllers/connectorActivationController.ts'));
  const disallowed = [
    'ownership intelligence',
    'owner name',
    'owner id',
    'tkgm bypass',
    'e-devlet bypass',
    'scrape protected',
  ];

  const scopedFiles = [
    path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsConnector.ts'),
    path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsLayerCatalog.ts'),
    path.join(ROOT, 'apps/api/src/connectors/ogc/ogcCapabilitiesClient.ts'),
    path.join(ROOT, 'apps/api/src/connectors/ogc/capabilitiesParser.ts'),
  ];

  const violations: Array<{ file: string; keyword: string }> = [];
  for (const file of scopedFiles) {
    const content = read(file);
    for (const keyword of disallowed) {
      if (content.includes(keyword)) {
        violations.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), keyword });
      }
    }
  }

  const modePass = tucbsConnector.includes('read_only_geo_layers') && tucbsConnector.includes('ownershipdata: false');
  const controllerPass = controller.includes('read_only_geo_layers');

  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:read-only-geo-mode',
    overallStatus: modePass && controllerPass && violations.length === 0 ? 'PASS' : 'FAIL',
    checks: {
      modePass,
      controllerPass,
      violations,
    },
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/read-only-geo-mode-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/read-only-geo-mode-audit.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
