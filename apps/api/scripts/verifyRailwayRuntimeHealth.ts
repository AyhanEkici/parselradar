import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';

type Check = { status: Status; detail: string };

type ProbeResult = Check & {
  url: string;
  statusCode?: number;
  contentType?: string | null;
  bodyPreview?: string;
  allowOrigin?: string | null;
  allowCredentials?: string | null;
  allowHeaders?: string | null;
  allowMethods?: string | null;
};

const VERCEL_ORIGIN = 'https://parselradar.vercel.app';
const CANDIDATES = [
  String(process.env.RAILWAY_API_URL || '').trim(),
  String(process.env.API_URL || '').trim(),
  String(process.env.CORS_VERIFY_TARGET || '').trim(),
  'https://parselradar-production.up.railway.app',
  'https://api.parselradar.com',
].filter(Boolean);

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'railway-runtime-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Railway Runtime Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push(`Active target: ${bundle.activeTarget || 'unresolved'}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String(value?.status || '')} | ${String(value?.detail || '')} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'railway-runtime-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function probe(url: string, init?: RequestInit): Promise<ProbeResult> {
  try {
    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    const bodyPreview = text.replace(/\s+/g, ' ').trim().slice(0, 220);
    const looksLikeJson = Boolean(contentType && contentType.toLowerCase().includes('application/json')) || bodyPreview.startsWith('{');
    const looksLikeHtml = Boolean(contentType && contentType.toLowerCase().includes('text/html')) || bodyPreview.startsWith('<!doctype html') || bodyPreview.startsWith('<html');

    return {
      url,
      status: response.ok && looksLikeJson && !looksLikeHtml ? 'PASS' : 'FAIL',
      detail: response.ok && looksLikeJson && !looksLikeHtml ? 'JSON response received.' : `Unexpected response status=${response.status}, contentType=${contentType || 'none'}`,
      statusCode: response.status,
      contentType,
      bodyPreview,
      allowOrigin: response.headers.get('access-control-allow-origin'),
      allowCredentials: response.headers.get('access-control-allow-credentials'),
      allowHeaders: response.headers.get('access-control-allow-headers'),
      allowMethods: response.headers.get('access-control-allow-methods'),
    };
  } catch (error: any) {
    return { url, status: 'WARN', detail: `Request failed: ${error?.message || 'network_error'}` };
  }
}

async function probeOptions(url: string): Promise<ProbeResult> {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: VERCEL_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });
    const contentType = response.headers.get('content-type');
    return {
      url,
      status: response.status === 200 || response.status === 204 ? 'PASS' : 'FAIL',
      detail: response.status === 200 || response.status === 204 ? 'Preflight returned an expected CORS status.' : `Unexpected preflight status=${response.status}`,
      statusCode: response.status,
      contentType,
      bodyPreview: '',
      allowOrigin: response.headers.get('access-control-allow-origin'),
      allowCredentials: response.headers.get('access-control-allow-credentials'),
      allowHeaders: response.headers.get('access-control-allow-headers'),
      allowMethods: response.headers.get('access-control-allow-methods'),
    };
  } catch (error: any) {
    return { url, status: 'WARN', detail: `Request failed: ${error?.message || 'network_error'}` };
  }
}

async function probePost(url: string): Promise<ProbeResult> {
  return probe(url, {
    method: 'POST',
    headers: {
      Origin: VERCEL_ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'runtime-health-check@example.com' }),
  });
}

async function resolveActiveTarget() {
  for (const candidate of CANDIDATES) {
    const base = candidate.replace(/\/+$/, '');
    const health = await probe(`${base}/health`);
    if (health.status === 'PASS') {
      return { target: base, health };
    }
  }

  return { target: CANDIDATES[0] || '', health: { status: 'FAIL' as const, detail: 'No active Railway target responded with JSON health.' } };
}

function readProof(fileName: string): any | null {
  const filePath = path.resolve(process.cwd(), 'proof', fileName);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  const active = await resolveActiveTarget();
  const base = active.target;

  const health = await probe(`${base}/health`);
  const buildInfo = await probe(`${base}/__buildinfo`);
  const loginOptions = await probeOptions(`${base}/auth/login`);
  const forgotOptions = await probeOptions(`${base}/auth/forgot-password`);
  const resetOptions = await probeOptions(`${base}/auth/reset-password`);
  const forgotPost = await probePost(`${base}/auth/forgot-password`);
  const resetPost = await probe(`${base}/auth/reset-password`, {
    method: 'POST',
    headers: {
      Origin: VERCEL_ORIGIN,
      'Content-Type': 'application/json',
    },
    // Intentionally invalid token — expect 400/422/200, NOT 404
    body: JSON.stringify({ token: 'invalid-token-probe', password: 'SomePassword1!' }),
  });

  const runtimeBootProof = readProof('runtime-boot-proof-bundle.json');
  const liveApiTransportProof = readProof('live-api-transport-proof-bundle.json');

  const proofs: Record<string, Check> = {
    activeTargetProof: base
      ? { status: 'PASS', detail: `Resolved active Railway target: ${base}` }
      : { status: 'FAIL', detail: 'Unable to resolve active Railway target.' },
    targetHealthProof: active.health,
    healthEndpointProof: health,
    buildInfoEndpointProof: buildInfo,
    loginPreflightProof: {
      status: loginOptions.status,
      detail: loginOptions.detail,
    },
    forgotPreflightProof: {
      status: forgotOptions.status,
      detail: forgotOptions.detail,
    },
    resetPreflightProof: {
      status: resetOptions.status,
      detail: resetOptions.detail,
    },
    forgotPostProof: {
      // 200 = generic success, 429 = rate limited (route exists), anything but 404 = route is mounted
      status: forgotPost.statusCode !== 404 ? 'PASS' : 'FAIL',
      detail: forgotPost.statusCode !== 404
        ? `POST /auth/forgot-password returned ${forgotPost.statusCode} (route is mounted)`
        : `POST /auth/forgot-password returned 404 — route is NOT mounted on live Railway`,
    },
    resetPostProof: {
      // 400/422 = invalid token (route exists), 429 = rate limited (route exists), NOT 404
      status: resetPost.statusCode !== 404 ? 'PASS' : 'FAIL',
      detail: resetPost.statusCode !== 404
        ? `POST /auth/reset-password returned ${resetPost.statusCode} (route is mounted)`
        : `POST /auth/reset-password returned 404 — route is NOT mounted on live Railway`,
    },
    runtimeBootProof: runtimeBootProof?.overallStatus === 'PASS'
      ? { status: 'PASS', detail: 'Local runtime boot proof is passing.' }
      : { status: 'WARN', detail: 'Local runtime boot proof is missing or not passing.' },
    liveApiTransportProof: liveApiTransportProof?.overallStatus === 'PASS'
      ? { status: 'PASS', detail: 'Live API transport proof is passing.' }
      : { status: 'WARN', detail: 'Live API transport proof is missing or not passing.' },
    originHeaderProof: {
      status: [loginOptions.allowOrigin, forgotOptions.allowOrigin, resetOptions.allowOrigin].some((value) => value === VERCEL_ORIGIN) ? 'PASS' : 'FAIL',
      detail: `Observed ACAO headers: login=${loginOptions.allowOrigin || 'none'}, forgot=${forgotOptions.allowOrigin || 'none'}, reset=${resetOptions.allowOrigin || 'none'}`,
    },
    credentialsHeaderProof: {
      status: [loginOptions.allowCredentials, forgotOptions.allowCredentials, resetOptions.allowCredentials].some((value) => String(value || '').toLowerCase() === 'true') ? 'PASS' : 'FAIL',
      detail: `Observed ACC headers: login=${loginOptions.allowCredentials || 'none'}, forgot=${forgotOptions.allowCredentials || 'none'}, reset=${resetOptions.allowCredentials || 'none'}`,
    },
    allowedMethodsProof: {
      status: [loginOptions.allowMethods, forgotOptions.allowMethods, resetOptions.allowMethods].some((value) => String(value || '').includes('POST') && String(value || '').includes('OPTIONS')) ? 'PASS' : 'FAIL',
      detail: `Observed ACAM headers: login=${loginOptions.allowMethods || 'none'}, forgot=${forgotOptions.allowMethods || 'none'}, reset=${resetOptions.allowMethods || 'none'}`,
    },
    allowedHeadersProof: {
      status: [loginOptions.allowHeaders, forgotOptions.allowHeaders, resetOptions.allowHeaders].some((value) => String(value || '').includes('Content-Type') && String(value || '').includes('Authorization')) ? 'PASS' : 'FAIL',
      detail: `Observed ACAH headers: login=${loginOptions.allowHeaders || 'none'}, forgot=${forgotOptions.allowHeaders || 'none'}, reset=${resetOptions.allowHeaders || 'none'}`,
    },
    noHtmlResponseProof: {
      status: [health, buildInfo, loginOptions, forgotOptions, resetOptions, forgotPost, resetPost].every((item) => !String(item.contentType || '').includes('text/html') && !String(item.bodyPreview || '').toLowerCase().startsWith('<html') && !String(item.bodyPreview || '').toLowerCase().startsWith('<!doctype html')) ? 'PASS' : 'FAIL',
      detail: 'Checked that the runtime endpoints did not return HTML bodies.',
    },
  };

  const overallStatus: Status = Object.values(proofs).every((value) => value.status === 'PASS') ? 'PASS' : 'FAIL';
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    activeTarget: base,
    commitHash: process.env.VERIFY_RAILWAY_RUNTIME_COMMIT_HASH || process.env.VERIFY_LIVE_API_COMMIT_HASH || '',
    proofs,
  };

  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus, proofPath: 'proof/railway-runtime-proof-bundle.json', activeTarget: base })}\n`);
  if (overallStatus !== 'PASS') process.exit(1);
}

main().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    activeTarget: '',
    commitHash: process.env.VERIFY_RAILWAY_RUNTIME_COMMIT_HASH || '',
    proofs: {
      activeTargetProof: { status: 'FAIL', detail: error?.message || 'verify_railway_runtime_failed' },
    },
  };
  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus: 'FAIL', proofPath: 'proof/railway-runtime-proof-bundle.json', error: error?.message || 'verify_railway_runtime_failed' })}\n`);
  process.exit(1);
});
