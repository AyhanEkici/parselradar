import fs from 'fs';
import path from 'path';

type CheckResult = {
  name: string;
  pass: boolean;
  detail: string;
};

const repoRoot = path.resolve(__dirname, '..');
const dockerfilePath = path.join(repoRoot, 'Dockerfile');

function runChecks(): CheckResult[] {
  const checks: CheckResult[] = [];

  const dockerfileExists = fs.existsSync(dockerfilePath);
  checks.push({
    name: 'Dockerfile exists',
    pass: dockerfileExists,
    detail: dockerfileExists ? 'Root Dockerfile is present.' : 'Root Dockerfile is missing.',
  });

  if (!dockerfileExists) {
    return checks;
  }

  const raw = fs.readFileSync(dockerfilePath, 'utf8');

  const sharedBuildIndex = raw.indexOf('RUN npm run build --prefix packages/shared');
  const apiBuildIndex = raw.indexOf('RUN npm run build --prefix apps/api');
  checks.push({
    name: 'Build order packages/shared before apps/api',
    pass: sharedBuildIndex >= 0 && apiBuildIndex > sharedBuildIndex,
    detail:
      sharedBuildIndex >= 0 && apiBuildIndex > sharedBuildIndex
        ? 'packages/shared is built before apps/api.'
        : 'Expected packages/shared build before apps/api build.',
  });

  checks.push({
    name: 'apps/api build command exists',
    pass: apiBuildIndex >= 0,
    detail:
      apiBuildIndex >= 0
        ? 'Dockerfile contains npm run build --prefix apps/api.'
        : 'Missing npm run build --prefix apps/api in Dockerfile.',
  });

  const cmdMatch = /CMD\s*\[\s*"npm"\s*,\s*"start"\s*\]/m.test(raw);
  checks.push({
    name: 'CMD starts apps/api',
    pass: cmdMatch,
    detail: cmdMatch ? 'Dockerfile CMD uses npm start.' : 'Dockerfile CMD is not npm start.',
  });

  const lines = raw.split(/\r?\n/);
  const buildLineIndex = lines.findIndex((line) => line.includes('RUN npm run build --prefix apps/api'));
  const overwriteAfterBuild = lines.some((line, idx) => {
    if (idx <= buildLineIndex) return false;
    const trimmed = line.trim();
    if (!trimmed.startsWith('COPY')) return false;
    return /COPY\s+\.\s+\/app/i.test(trimmed) || /COPY\s+apps\/api\s+apps\/api/i.test(trimmed);
  });

  checks.push({
    name: 'No source COPY after api build that can overwrite dist',
    pass: buildLineIndex >= 0 && !overwriteAfterBuild,
    detail:
      buildLineIndex < 0
        ? 'Cannot evaluate overwrite risk because api build command is missing.'
        : overwriteAfterBuild
        ? 'Found COPY instruction after api build that can overwrite build artifacts.'
        : 'No overwrite COPY detected after api build.',
  });

  return checks;
}

function main() {
  const checks = runChecks();
  let failures = 0;

  for (const check of checks) {
    const status = check.pass ? 'PASS' : 'FAIL';
    if (!check.pass) failures += 1;
    console.log(`[${status}] ${check.name} - ${check.detail}`);
  }

  if (failures > 0) {
    console.error(`docker backend build check: FAIL (${failures} failed checks)`);
    process.exit(1);
  }

  console.log('docker backend build check: PASS');
}

main();
