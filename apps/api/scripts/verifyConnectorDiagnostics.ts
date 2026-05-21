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
  const types = read(path.join(ROOT, 'apps/api/src/connectors/ogc/ogcTypes.ts'));
  const catalog = read(path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsLayerCatalog.ts'));
  const controller = read(path.join(ROOT, 'apps/api/src/controllers/connectorActivationController.ts'));

  const checks: Check[] = [
    check('diagnostics include availability', types.includes('availability') && types.includes('latencyMs'), 'Diagnostics should include availability and latency.'),
    check('diagnostics include parse state', types.includes('parseState'), 'Diagnostics should include capability parse state.'),
    check('diagnostics include layer count', types.includes('layerCount'), 'Diagnostics should include layer count.'),
    check('diagnostics include projection support', types.includes('projectionSupport'), 'Diagnostics should include projection support.'),
    check('diagnostics include last sync', types.includes('lastSync'), 'Diagnostics should include last sync timestamp.'),
    check('health endpoint implemented', catalog.includes('getTucbsLayerHealth') && controller.includes('getAdminLayerHealth'), 'Layer health endpoint should return diagnostics.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:connector-diagnostics',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/connector-diagnostics-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/connector-diagnostics-audit.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
