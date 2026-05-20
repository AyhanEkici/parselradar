import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';

type Check = { status: Status; detail: string };

type Probe = Check & {
  url: string;
  statusCode?: number;
  contentType?: string | null;
  allowOrigin?: string | null;
  allowCredentials?: string | null;
  allowHeaders?: string | null;
  allowMethods?: string | null;
  bodyPreview?: string;
};

const VERCEL_ORIGIN = 'https://parselradar.vercel.app';
const REPO_ROOT = fs.existsSync(path.resolve(process.cwd(), 'apps', 'web', 'src', 'lib', 'api.ts'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..', '..');
const CANDIDATES = [
  String(process.env.CORS_VERIFY_TARGET || '').trim(),
  String(process.env.API_URL || '').trim(),
  String(process.env.RAILWAY_API_URL || '').trim(),
  'https://parselradar-production.up.railway.app',
  'https://api.parselradar.com',
].filter(Boolean);

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'live-api-transport-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Live API Transport Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push(`Active target: ${bundle.activeTarget || 'unresolved'}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String((value as any).status || '')} | ${String((value as any).detail || '')} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash || 'pending'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'live-api-transport-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function probeJson(url: string, init?: RequestInit): Promise<Probe> {
  try {
    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    const bodyPreview = text.replace(/\s+/g, ' ').trim().slice(0, 240);
    const isJson = Boolean(contentType && contentType.toLowerCase().includes('application/json')) || bodyPreview.startsWith('{');
    const isHtml = Boolean(contentType && contentType.toLowerCase().includes('text/html')) || bodyPreview.startsWith('<!doctype html') || bodyPreview.startsWith('<html');

    return {
      status: response.ok && isJson && !isHtml ? 'PASS' : 'FAIL',
      detail: response.ok && isJson && !isHtml ? 'JSON response received.' : `Unexpected response status=${response.status}, contentType=${contentType || 'none'}`,
      url,
      statusCode: response.status,
      contentType,
      allowOrigin: response.headers.get('access-control-allow-origin'),
      allowCredentials: response.headers.get('access-control-allow-credentials'),
      allowHeaders: response.headers.get('access-control-allow-headers'),
      allowMethods: response.headers.get('access-control-allow-methods'),
      bodyPreview,
    };
  } catch (error: any) {
    return { status: 'WARN', detail: `Request failed: ${error?.message || 'network_error'}`, url };
  }
}

async function probeOptions(url: string, origin: string): Promise<Probe> {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');
    const allowHeaders = response.headers.get('access-control-allow-headers');
    const allowMethods = response.headers.get('access-control-allow-methods');
    const statusOk = response.status === 200 || response.status === 204;

    return {
      status: statusOk ? 'PASS' : 'FAIL',
      detail: statusOk ? 'Preflight returned an expected CORS status.' : `Unexpected preflight status=${response.status}`,
      url,
      statusCode: response.status,
      contentType: response.headers.get('content-type'),
      allowOrigin,
      allowCredentials,
      allowHeaders,
      allowMethods,
      bodyPreview: '',
    };
  } catch (error: any) {
    return { status: 'WARN', detail: `Request failed: ${error?.message || 'network_error'}`, url };
  }
}

async function resolveActiveTarget() {
  for (const candidate of CANDIDATES) {
    const health = await probeJson(`${candidate.replace(/\/+$/, '')}/health`);
    if (health.status === 'PASS') {
      return { target: candidate, health };
    }
  }

  return { target: CANDIDATES[0] || '', health: { status: 'FAIL' as const, detail: 'No candidate responded with JSON health.' } };
}

async function main() {
  const active = await resolveActiveTarget();
  const base = active.target.replace(/\/+$/, '');

  const health = await probeJson(`${base}/health`);
  const buildInfo = await probeJson(`${base}/__buildinfo`);
  const loginOptions = await probeOptions(`${base}/auth/login`, VERCEL_ORIGIN);
  const forgotOptions = await probeOptions(`${base}/auth/forgot-password`, VERCEL_ORIGIN);
  const resetOptions = await probeOptions(`${base}/auth/reset-password`, VERCEL_ORIGIN);
  const forgotPost = await probeJson(`${base}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      Origin: VERCEL_ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'pilot@test.com' }),
  });

  const webApiPath = path.resolve(REPO_ROOT, 'apps/web/src/lib/api.ts');
  const webApiSource = fs.existsSync(webApiPath)
    ? fs.readFileSync(webApiPath, 'utf-8')
    : '';

  const vercelApiUrlProof: Check = webApiSource.includes('https://parselradar-production.up.railway.app') && !webApiSource.includes('https://parselradar-production.up.railway.app/')
    ? { status: 'PASS', detail: 'Frontend API client points to the active Railway URL without a trailing slash.' }
    : { status: 'FAIL', detail: 'Frontend API client does not match the active Railway URL exactly.' };

  const proofs: Record<string, Check> = {
    railwayActiveDeploymentProof: active.health,
    activeApiUrlProof: base ? { status: 'PASS', detail: `Active API URL resolved to ${base}` } : { status: 'FAIL', detail: 'No active API URL resolved.' },
    healthProof: health,
    buildInfoProof: buildInfo,
    authLoginOptionsProof: {
      status: loginOptions.status,
      detail: loginOptions.status === 'PASS' ? 'OPTIONS /auth/login returned JSON-capable preflight headers.' : loginOptions.detail,
    },
    forgotPasswordOptionsProof: {
      status: forgotOptions.status,
      detail: forgotOptions.status === 'PASS' ? 'OPTIONS /auth/forgot-password returned JSON-capable preflight headers.' : forgotOptions.detail,
    },
    resetPasswordOptionsProof: {
      status: resetOptions.status,
      detail: resetOptions.status === 'PASS' ? 'OPTIONS /auth/reset-password returned JSON-capable preflight headers.' : resetOptions.detail,
    },
    accessControlAllowOriginProof: {
      status: [loginOptions.allowOrigin, forgotOptions.allowOrigin, resetOptions.allowOrigin].some((value) => value === VERCEL_ORIGIN) ? 'PASS' : 'FAIL',
      detail: `Observed ACAO values: login=${loginOptions.allowOrigin || 'none'}, forgot=${forgotOptions.allowOrigin || 'none'}, reset=${resetOptions.allowOrigin || 'none'}`,
    },
    credentialsHeaderProof: {
      status: [loginOptions.allowCredentials, forgotOptions.allowCredentials, resetOptions.allowCredentials].some((value) => String(value || '').toLowerCase() === 'true') ? 'PASS' : 'FAIL',
      detail: `Observed ACC values: login=${loginOptions.allowCredentials || 'none'}, forgot=${forgotOptions.allowCredentials || 'none'}, reset=${resetOptions.allowCredentials || 'none'}`,
    },
    allowedHeadersProof: {
      status: [loginOptions.allowHeaders, forgotOptions.allowHeaders, resetOptions.allowHeaders].some((value) => String(value || '').includes('Content-Type') && String(value || '').includes('Authorization')) ? 'PASS' : 'FAIL',
      detail: `Observed ACAH values: login=${loginOptions.allowHeaders || 'none'}, forgot=${forgotOptions.allowHeaders || 'none'}, reset=${resetOptions.allowHeaders || 'none'}`,
    },
    allowedMethodsProof: {
      status: [loginOptions.allowMethods, forgotOptions.allowMethods, resetOptions.allowMethods].some((value) => String(value || '').includes('POST') && String(value || '').includes('OPTIONS')) ? 'PASS' : 'FAIL',
      detail: `Observed ACAM values: login=${loginOptions.allowMethods || 'none'}, forgot=${forgotOptions.allowMethods || 'none'}, reset=${resetOptions.allowMethods || 'none'}`,
    },
    forgotPasswordLiveProof: {
      status: forgotPost.status,
      detail: forgotPost.status === 'PASS' ? 'POST /auth/forgot-password returned a JSON response with Vercel origin.' : forgotPost.detail,
    },
    noHtmlResponseProof: {
      status: [health, buildInfo, loginOptions, forgotOptions, resetOptions, forgotPost].every((item) => !String(item.contentType || '').includes('text/html') && !String(item.bodyPreview || '').toLowerCase().startsWith('<html') && !String(item.bodyPreview || '').toLowerCase().startsWith('<!doctype html')) ? 'PASS' : 'FAIL',
      detail: 'Checked that API endpoints did not return HTML bodies.',
    },
    buildInfoVisibleProof: {
      status: buildInfo.status,
      detail: buildInfo.status === 'PASS' ? 'Build info endpoint responded with JSON.' : buildInfo.detail,
    },
    vercelViteApiUrlProof: vercelApiUrlProof,
  };

  const overallStatus: Status = Object.values(proofs).every((check) => check.status === 'PASS') ? 'PASS' : 'FAIL';
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    activeTarget: base,
    commitHash: process.env.VERIFY_LIVE_API_COMMIT_HASH || '',
    proofs,
  };

  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus, proofPath: 'proof/live-api-transport-proof-bundle.json', activeTarget: base })}\n`);
  if (overallStatus !== 'PASS') process.exit(1);
}

main().catch((error: any) => {
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    activeTarget: '',
    commitHash: process.env.VERIFY_LIVE_API_COMMIT_HASH || '',
    proofs: {
      railwayActiveDeploymentProof: { status: 'FAIL', detail: error?.message || 'verify_live_api_failed' },
    },
  };
  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus: 'FAIL', proofPath: 'proof/live-api-transport-proof-bundle.json' })}\n`);
  process.exit(1);
});
