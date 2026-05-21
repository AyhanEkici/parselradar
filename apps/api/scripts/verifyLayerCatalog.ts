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
  const catalog = read(path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsLayerCatalog.ts'));
  const routes = read(path.join(ROOT, 'apps/api/src/routes/connectorActivationRoutes.ts'));
  const controller = read(path.join(ROOT, 'apps/api/src/controllers/connectorActivationController.ts'));

  const checks: Check[] = [
    check('layer catalog sync exists', catalog.includes('syncTucbsLayerCatalog'), 'Layer catalog sync function should exist.'),
    check('layer visibility patch exists', catalog.includes('patchLayerVisibility'), 'Layer visibility/opacity patch should exist.'),
    check('admin layers route exists', routes.includes("'/admin/layers'"), 'Admin layers route should exist.'),
    check('layer health route exists', routes.includes("'/admin/layer-health'"), 'Admin layer health route should exist.'),
    check('controller exposes layer endpoints', controller.includes('getAdminLayers') && controller.includes('patchAdminLayerVisibility') && controller.includes('getAdminLayerHealth'), 'Controller should expose layer catalog endpoints.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:layer-catalog',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/layer-catalog-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/layer-catalog-audit.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
