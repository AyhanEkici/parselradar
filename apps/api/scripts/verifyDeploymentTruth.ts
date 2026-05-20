import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

type Status = 'PASS' | 'WARN' | 'FAIL';
type Check = { status: Status; detail: string };

const RAILWAY_URL = 'https://parselradar-production.up.railway.app';
const VERCEL_URL = 'https://parselradar.vercel.app';
const REQUIRED_COMMITS = ['fd956a58', '80d94b53', 'ce3d58db'];

function runGit(command: string): string {
  return execSync(command, { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
    .toString('utf8')
    .trim();
}

function safeGit(command: string): string | null {
  try {
    return runGit(command);
  } catch {
    return null;
  }
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'deployment-truth-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  const lines: string[] = [];
  lines.push('# Deployment Truth Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String((value as any).status || '')} | ${String((value as any).detail || '').replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'deployment-truth-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf8');
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string; contentType: string | null }> {
  const res = await fetch(url);
  return {
    ok: res.ok,
    status: res.status,
    text: await res.text(),
    contentType: res.headers.get('content-type'),
  };
}

function isAncestor(ancestor: string, descendant: string): boolean | null {
  try {
    execSync(`git merge-base --is-ancestor ${ancestor} ${descendant}`, { cwd: process.cwd(), stdio: 'ignore' });
    return true;
  } catch {
    // Could be non-ancestor OR commit missing locally; differentiate.
    const hasAncestor = safeGit(`git cat-file -e ${ancestor}^{commit}`) !== null;
    const hasDescendant = safeGit(`git cat-file -e ${descendant}^{commit}`) !== null;
    if (!hasAncestor || !hasDescendant) return null;
    return false;
  }
}

async function main() {
  // Keep local refs fresh before computing truth checks.
  safeGit('git fetch origin main --prune');

  const localHead = safeGit('git rev-parse HEAD');
  const originMain = safeGit('git rev-parse origin/main');

  const health = await fetchText(`${RAILWAY_URL}/health`);
  const buildInfo = await fetchText(`${RAILWAY_URL}/__buildinfo`);

  let railwayGitSha = '';
  try {
    const parsed = JSON.parse(buildInfo.text || '{}');
    railwayGitSha = String(parsed.gitSha || '').trim();
  } catch {
    railwayGitSha = '';
  }

  const vercelLogin = await fetchText(`${VERCEL_URL}/login`);

  const scriptMatch = vercelLogin.text.match(/<script[^>]+src=["']([^"']+\.js)["'][^>]*>/i);
  const activeJsPath = scriptMatch ? scriptMatch[1] : '';
  const activeJsUrl = activeJsPath
    ? activeJsPath.startsWith('http')
      ? activeJsPath
      : `${VERCEL_URL}${activeJsPath.startsWith('/') ? '' : '/'}${activeJsPath}`
    : '';

  let vercelBundleContainsAuthMarkers: string[] = [];
  let vercelBundleFetchStatus: number | null = null;
  if (activeJsUrl) {
    try {
      const bundle = await fetchText(activeJsUrl);
      vercelBundleFetchStatus = bundle.status;
      const source = bundle.text || '';
      const markers = ['parselradar_token', 'authStorage', 'auth:changed', '/auth/me', '/credits'];
      vercelBundleContainsAuthMarkers = markers.filter((marker) => source.includes(marker));
    } catch {
      vercelBundleFetchStatus = null;
    }
  }

  const proofs: Record<string, Check> = {};

  proofs.localHeadProof = localHead
    ? { status: 'PASS', detail: `local HEAD = ${localHead}` }
    : { status: 'FAIL', detail: 'Could not resolve local HEAD.' };

  proofs.originMainProof = originMain
    ? { status: 'PASS', detail: `origin/main HEAD = ${originMain}` }
    : { status: 'FAIL', detail: 'Could not resolve origin/main HEAD.' };

  proofs.railwayHealthProof = health.ok
    ? { status: 'PASS', detail: `/health reachable with status ${health.status}.` }
    : { status: 'FAIL', detail: `/health not healthy: status ${health.status}.` };

  proofs.railwayGitShaProof = railwayGitSha
    ? { status: 'PASS', detail: `Railway /__buildinfo gitSha = ${railwayGitSha}` }
    : { status: 'FAIL', detail: `Railway /__buildinfo missing gitSha. status=${buildInfo.status}` };

  const aligned = Boolean(originMain && railwayGitSha && originMain === railwayGitSha);
  proofs.commitAlignmentProof = aligned
    ? { status: 'PASS', detail: `Railway gitSha matches origin/main (${railwayGitSha}).` }
    : {
        status: railwayGitSha && originMain ? 'FAIL' : 'WARN',
        detail: `Mismatch: local=${localHead || 'unknown'}, origin/main=${originMain || 'unknown'}, railway=${railwayGitSha || 'unknown'}`,
      };

  for (const required of REQUIRED_COMMITS) {
    const key = `requiredCommit_${required}_Proof`;
    if (!railwayGitSha) {
      proofs[key] = { status: 'WARN', detail: 'Railway gitSha unavailable; cannot evaluate ancestry.' };
      continue;
    }
    const ancestor = isAncestor(required, railwayGitSha);
    if (ancestor === true) {
      proofs[key] = { status: 'PASS', detail: `${required} is reachable in Railway gitSha ${railwayGitSha}.` };
    } else if (ancestor === false) {
      proofs[key] = { status: 'FAIL', detail: `${required} is NOT reachable in Railway gitSha ${railwayGitSha}.` };
    } else {
      proofs[key] = { status: 'WARN', detail: `Could not prove ancestry for ${required} -> ${railwayGitSha} (missing commit locally).` };
    }
  }

  proofs.vercelLoginReachableProof = vercelLogin.ok
    ? { status: 'PASS', detail: `/login reachable on Vercel with status ${vercelLogin.status}.` }
    : { status: 'FAIL', detail: `/login not reachable on Vercel. status=${vercelLogin.status}` };

  proofs.vercelActiveBundleProof = activeJsUrl
    ? { status: 'PASS', detail: `Active Vercel JS bundle = ${activeJsUrl}` }
    : { status: 'WARN', detail: 'Could not determine active JS bundle from /login HTML.' };

  proofs.vercelBundleAuthMarkerProof = activeJsUrl
    ? vercelBundleContainsAuthMarkers.length > 0
      ? {
          status: 'PASS',
          detail: `Bundle fetched (status=${vercelBundleFetchStatus || 'unknown'}) and contains auth markers: ${vercelBundleContainsAuthMarkers.join(', ')}`,
        }
      : {
          status: 'WARN',
          detail: `Bundle fetched (status=${vercelBundleFetchStatus || 'unknown'}) but no expected auth markers were found.`,
        }
    : { status: 'WARN', detail: 'Bundle not inspectable because script URL could not be extracted.' };

  proofs.backendHealthReachableProof = health.ok
    ? { status: 'PASS', detail: 'Backend /health reachable.' }
    : { status: 'FAIL', detail: 'Backend /health unreachable.' };

  const failing = Object.values(proofs).filter((p) => p.status === 'FAIL').length;
  const warning = Object.values(proofs).filter((p) => p.status === 'WARN').length;
  const overallStatus: Status = failing > 0 ? 'FAIL' : warning > 0 ? 'WARN' : 'PASS';

  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    proofs,
    commitHash: safeGit('git rev-parse --short HEAD') || '',
    nextAction:
      aligned
        ? 'Alignment PASS. Continue behavior debugging only if runtime checks fail.'
        : 'Alignment FAIL/WARN. Do not debug app behavior until Railway/Vercel deployment catches up.',
  };

  writeProof(bundle);
  console.log(JSON.stringify({ overallStatus, proofPath: 'proof/deployment-truth-proof-bundle.json' }));
  if (overallStatus === 'FAIL') process.exit(1);
}

main().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    proofs: {
      scriptFailureProof: { status: 'FAIL', detail: error?.message || 'verifyDeploymentTruth failed unexpectedly.' },
    },
    commitHash: safeGit('git rev-parse --short HEAD') || '',
    nextAction: 'Fix verifier runtime error before trusting deployment state.',
  };
  writeProof(bundle);
  console.log(JSON.stringify({ overallStatus: 'FAIL', proofPath: 'proof/deployment-truth-proof-bundle.json' }));
  process.exit(1);
});