import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();
const retryFile = path.join(ROOT, 'apps/web/src/lib/RetryableFetch.ts');
const apiFile = path.join(ROOT, 'apps/web/src/lib/api.ts');
const telemetryMiddleware = path.join(ROOT, 'apps/api/src/middleware/operationalTelemetry.ts');

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const retry = read(retryFile);
  const api = read(apiFile);
  const telemetry = read(telemetryMiddleware);

  const checks: Check[] = [
    check('retry utility exists', retry.includes('retryableFetch'), 'Retry utility should exist.'),
    check('safe get retry policy', retry.includes("method || 'GET'") && retry.includes('isSafeRetryMethod'), 'Retry should be constrained to safe GET requests.'),
    check('exponential backoff', retry.includes('Math.pow(2, attempt)'), 'Retry should use exponential backoff.'),
    check('timeout handling', retry.includes('REQUEST_TIMEOUT') || retry.includes('AbortController'), 'Retry must include timeout handling.'),
    check('apiFetch uses retry utility', api.includes('retryableFetch('), 'apiFetch should call retry utility.'),
    check('non-get no dead retries', api.includes('maxRetries: 0'), 'Non-GET operations should not retry.'),
    check('retry attempts observable', telemetry.includes('client_request_retried') && telemetry.includes('x-client-retry-attempts'), 'Retry attempts should be observable/auditable.'),
  ];

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:retry-integrity',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/retry-integrity-audit.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/retry-integrity-audit.json' }, null, 2));
  if (failed.length > 0) process.exit(1);
}

main();
