const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function repoRoot() {
  // apps/api/scripts -> apps/api -> apps -> repo root
  return path.resolve(__dirname, '..', '..', '..');
}

function safeGitSha(cwd) {
  try {
    const out = execSync('git rev-parse HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return out || null;
  } catch {
    return null;
  }
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function main() {
  const root = repoRoot();
  const envGitSha = firstNonEmpty(
    process.env.GIT_SHA,
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.RAILWAY_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.CI_COMMIT_SHA,
    process.env.SOURCE_VERSION
  );
  const gitSha = firstNonEmpty(
    envGitSha,
    safeGitSha(root),
    safeGitSha(path.join(root, 'apps', 'api')),
    process.env.BUILD_GIT_SHA
  ) || 'unavailable';
  const buildTime = process.env.BUILD_TIME_ISO || new Date().toISOString();

  const outDir = path.join(root, 'apps', 'api', 'src', 'generated');
  const outFile = path.join(outDir, 'buildInfo.ts');
  fs.mkdirSync(outDir, { recursive: true });

  const content = `export const BUILD_INFO = Object.freeze({
  gitSha: ${JSON.stringify(gitSha)},
  buildTime: ${JSON.stringify(buildTime)},
  platformVersion: "ParselRadar",
  routeVersion: "autonomous_intelligence_v28",
} as const);
`;

  fs.writeFileSync(outFile, content, 'utf-8');
  process.stdout.write(`generated ${path.relative(root, outFile).replace(/\\\\/g, '/')} (gitSha=${gitSha})\n`);
}

main();
