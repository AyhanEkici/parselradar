import fs from 'fs';
import path from 'path';

type CheckResult = {
  name: string;
  pass: boolean;
  detail: string;
};

const repoRoot = path.resolve(__dirname, '..');

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

function checkNoPostBuildCopy(dockerfile: string): CheckResult {
  const lines = dockerfile.split(/\r?\n/);
  const apiBuildLine = lines.findIndex((line) => line.includes('RUN npm run build --prefix apps/api'));
  if (apiBuildLine < 0) {
    return {
      name: 'Dockerfile has api build command',
      pass: false,
      detail: 'Missing RUN npm run build --prefix apps/api.',
    };
  }

  const riskyCopyAfterBuild = lines.some((line, idx) => {
    if (idx <= apiBuildLine) return false;
    const trimmed = line.trim();
    if (!trimmed.startsWith('COPY')) return false;
    return /COPY\s+\.\s+\/app/i.test(trimmed) || /COPY\s+apps\/api\s+apps\/api/i.test(trimmed) || /COPY\s+packages\/shared\s+packages\/shared/i.test(trimmed);
  });

  return {
    name: 'No post-build COPY can overwrite dist',
    pass: !riskyCopyAfterBuild,
    detail: riskyCopyAfterBuild
      ? 'Found COPY instruction after api build that can overwrite build artifacts.'
      : 'No risky COPY instruction found after api build.',
  };
}

function main() {
  const checks: CheckResult[] = [];

  checks.push({
    name: 'nixpacks.toml absent',
    pass: !exists('nixpacks.toml'),
    detail: exists('nixpacks.toml') ? 'nixpacks.toml must be removed.' : 'nixpacks.toml is absent.',
  });

  checks.push({
    name: 'Procfile absent',
    pass: !exists('Procfile'),
    detail: exists('Procfile') ? 'Procfile must be removed.' : 'Procfile is absent.',
  });

  const railwayExists = exists('railway.toml');
  checks.push({
    name: 'railway.toml exists',
    pass: railwayExists,
    detail: railwayExists ? 'railway.toml is present.' : 'railway.toml is missing.',
  });

  if (railwayExists) {
    const railway = read('railway.toml');
    checks.push({
      name: 'railway builder is DOCKERFILE',
      pass: /builder\s*=\s*"DOCKERFILE"/m.test(railway),
      detail: /builder\s*=\s*"DOCKERFILE"/m.test(railway)
        ? 'railway.toml builder is DOCKERFILE.'
        : 'railway.toml builder is not DOCKERFILE.',
    });
    checks.push({
      name: 'railway dockerfilePath is root Dockerfile',
      pass: /dockerfilePath\s*=\s*"Dockerfile"/m.test(railway),
      detail: /dockerfilePath\s*=\s*"Dockerfile"/m.test(railway)
        ? 'railway.toml dockerfilePath points to root Dockerfile.'
        : 'railway.toml dockerfilePath is missing or incorrect.',
    });
    checks.push({
      name: 'railway startCommand is not set',
      pass: !/startCommand\s*=/m.test(railway),
      detail: !/startCommand\s*=/m.test(railway)
        ? 'No startCommand in railway.toml; Dockerfile CMD is authoritative.'
        : 'Remove startCommand from railway.toml to keep Dockerfile CMD authoritative.',
    });
  }

  const dockerExists = exists('Dockerfile');
  checks.push({
    name: 'Dockerfile exists',
    pass: dockerExists,
    detail: dockerExists ? 'Dockerfile is present.' : 'Dockerfile is missing.',
  });

  if (dockerExists) {
    const dockerfile = read('Dockerfile');
    checks.push({
      name: 'Dockerfile CMD is authoritative',
      pass: /CMD\s*\[\s*"npm"\s*,\s*"start"\s*\]/m.test(dockerfile),
      detail: /CMD\s*\[\s*"npm"\s*,\s*"start"\s*\]/m.test(dockerfile)
        ? 'Dockerfile CMD starts the api process.'
        : 'Dockerfile CMD must be ["npm", "start"].',
    });
    checks.push(checkNoPostBuildCopy(dockerfile));
  }

  let failures = 0;
  for (const check of checks) {
    const status = check.pass ? 'PASS' : 'FAIL';
    if (!check.pass) failures += 1;
    console.log(`[${status}] ${check.name} - ${check.detail}`);
  }

  if (failures > 0) {
    console.error(`verify:railway-docker FAILED with ${failures} failed checks.`);
    process.exit(1);
  }

  console.log('verify:railway-docker PASSED');
}

main();