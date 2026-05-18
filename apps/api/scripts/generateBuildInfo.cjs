const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function repoRoot() {
  // apps/api/scripts -> apps/api -> apps -> repo root
  return path.resolve(__dirname, '..', '..', '..');
}

function safeGitSha(cwd) {
  try {
    return execSync('git rev-parse HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

function main() {
  const root = repoRoot();
  const gitSha = safeGitSha(root) || 'unavailable';
  const buildTime = process.env.BUILD_TIME_ISO || new Date().toISOString();

  const outDir = path.join(root, 'apps', 'api', 'src', 'generated');
  const outFile = path.join(outDir, 'buildInfo.ts');
  fs.mkdirSync(outDir, { recursive: true });

  const content = `export const BUILD_INFO = Object.freeze({
  gitSha: ${JSON.stringify(gitSha)},
  buildTime: ${JSON.stringify(buildTime)},
  platformVersion: "ParselRadar",
  routeVersion: "admin_observability_v1",
} as const);
`;

  fs.writeFileSync(outFile, content, 'utf-8');
  process.stdout.write(`generated ${path.relative(root, outFile).replace(/\\\\/g, '/')} (gitSha=${gitSha})\n`);
}

main();
