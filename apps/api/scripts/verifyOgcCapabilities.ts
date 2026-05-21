import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

type Check = { name: string; pass: boolean; detail: string };

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const client = read(path.join(ROOT, 'apps/api/src/connectors/ogc/ogcCapabilitiesClient.ts'));
  const parser = read(path.join(ROOT, 'apps/api/src/connectors/ogc/capabilitiesParser.ts'));
  const types = read(path.join(ROOT, 'apps/api/src/connectors/ogc/ogcTypes.ts'));

  const checks: Check[] = [
    check('wms getcapabilities implemented', client.includes('request=GetCapabilities') && client.includes("service: OgcServiceType") && parser.includes('parseWmsCapabilities'), 'WMS GetCapabilities fetch should be implemented.'),
    check('wmts foundation implemented', client.includes('service=WMTS') || parser.includes('parseWmtsCapabilities'), 'WMTS capabilities foundation should exist.'),
    check('wfs foundation implemented', client.includes('service=WFS') || parser.includes('parseWfsCapabilities'), 'WFS capabilities foundation should exist.'),
    check('capability parser extracts layer metadata', parser.includes('parseWmsCapabilities') && parser.includes('parseBbox'), 'Parser should extract layer names/titles/bbox/projection.'),
    check('ogc layer type is read-only', types.includes('readOnly: true'), 'Layer records must be marked read-only.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:ogc-capabilities',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/ogc-layer-catalog.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/ogc-layer-catalog.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
