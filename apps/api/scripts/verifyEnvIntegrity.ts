import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const backendEnv = path.join(ROOT, 'apps/api/src/config/envValidator.ts');
const indexFile = path.join(ROOT, 'apps/api/src/index.ts');
const frontendEnv = path.join(ROOT, 'apps/web/src/lib/envValidator.ts');
const apiFile = path.join(ROOT, 'apps/web/src/lib/api.ts');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const backend = read(backendEnv);
  const index = read(indexFile);
  const frontend = read(frontendEnv);
  const api = read(apiFile);

  const checks: Check[] = [
    check('backend env validator exists', backend.includes('validateRuntimeEnv'), 'Backend envValidator should exist.'),
    check('required env key checks', backend.includes('REQUIRED_KEYS'), 'Backend validator should check required keys.'),
    check('recommended env warnings', backend.includes('missingRecommended'), 'Backend validator should expose recommended missing secrets.'),
    check('startup env validation call', index.includes('validateRuntimeEnv()'), 'API startup should run env validation.'),
    check('frontend env validator exists', frontend.includes('validateFrontendEnv'), 'Frontend env validator should exist.'),
    check('api uses frontend env validator', api.includes('validateFrontendEnv()'), 'apiFetch base URL resolution should use frontend env validator.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:env-integrity',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/env-integrity-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/env-integrity-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
