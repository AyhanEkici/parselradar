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

async function main() {
  const contracts = read(path.join(ROOT, 'apps/api/src/connectors/connectorContracts.ts'));
  const registry = read(path.join(ROOT, 'apps/api/src/connectors/connectorRegistry.ts'));
  const execution = read(path.join(ROOT, 'apps/api/src/connectors/connectorExecutionRegistry.ts'));
  const tucbs = read(path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsConnector.ts'));
  const routes = read(path.join(ROOT, 'apps/api/src/routes/connectorActivationRoutes.ts'));

  const checks: Check[] = [
    check('connector key declared', contracts.includes("'tucbs_ogc'"), 'Connector key tucbs_ogc should be declared.'),
    check('connector registered', registry.includes("key: 'tucbs_ogc'"), 'TUCBS connector should be registered in connector registry.'),
    check('execution wired', execution.includes('tucbsConnectorExecution'), 'TUCBS execution contract should be in execution registry.'),
    check('read-only mode enforced', tucbs.includes('READ_ONLY_GEO_LAYERS') && tucbs.includes('ownershipData: false'), 'TUCBS connector should enforce read-only geo-layer mode.'),
    check('tucbs route exists', routes.includes("'/admin/connectors/tucbs'"), 'Admin route /admin/connectors/tucbs should exist.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:tucbs-connector',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/tucbs-capabilities-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/tucbs-capabilities-audit.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
