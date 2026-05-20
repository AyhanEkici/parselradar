import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

type Status = 'PASS' | 'FAIL' | 'WARN';

type Check = { status: Status; detail: string };

type Bundle = {
  generatedAt: string;
  overallStatus: Status;
  commitHash: string;
  proofs: Record<string, Check>;
};

const PORT = Number(process.env.RUNTIME_BOOT_PORT || 4017);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ROOT_DIR = process.cwd();
const API_DIR = path.resolve(ROOT_DIR, 'apps/api');
const API_DIST = path.resolve(API_DIR, 'dist/index.js');
const PROOF_DIR = path.resolve(ROOT_DIR, 'proof');

function writeProof(bundle: Bundle) {
  if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

  fs.writeFileSync(path.join(PROOF_DIR, 'runtime-boot-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Runtime Boot Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [name, value] of Object.entries(bundle.proofs)) {
    lines.push(`| ${name} | ${value.status} | ${value.detail} |`);
  }
  lines.push('');
  lines.push('## Commit Hash');
  lines.push('');
  lines.push(`- ${bundle.commitHash}`);
  lines.push('');

  fs.writeFileSync(path.join(PROOF_DIR, 'runtime-boot-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

async function probe(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const isJson = contentType.toLowerCase().includes('application/json') || text.trim().startsWith('{');
  const isHtml = contentType.toLowerCase().includes('text/html') || text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html');
  let parsed: any = null;
  if (isJson) {
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
  }
  return { response, text, parsed, isJson: isJson && !isHtml };
}

function getRequired(check: Check): Check {
  return check;
}

async function waitForBoot(timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'Boot not reached yet.';
  while (Date.now() < deadline) {
    try {
      const result = await probe(`${BASE_URL}/health`);
      if (result.response.ok && result.isJson && result.parsed) return result.parsed;
      lastError = `health status=${result.response.status}, contentType=${result.response.headers.get('content-type') || 'none'}`;
    } catch (error: any) {
      lastError = error?.message || String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(lastError);
}

function buildEnv() {
  return {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parselradar-runtime-boot',
    JWT_SECRET: process.env.JWT_SECRET || 'runtime-boot-secret',
    CLIENT_URL: process.env.CLIENT_URL || 'https://parselradar.vercel.app',
    REDIS_URL: '',
    STRIPE_SECRET_KEY: '',
    STRIPE_LIVE_SECRET_KEY: '',
    STRIPE_TEST_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SENTRY_DSN: '',
    DATADOG_API_KEY: '',
    OTEL_EXPORTER_OTLP_ENDPOINT: '',
    PROMETHEUS_PUSHGATEWAY: '',
    ENABLE_DISTRIBUTED_RUNTIME: 'false',
    RUNTIME_WORKERS_ENABLED: '0',
    RUNTIME_QUEUES_ENABLED: '0',
    OBSERVABILITY_DASHBOARD_ENABLED: 'false',
    AUTH_SAFE_DEBUG: 'false',
    CORS_SAFE_DEBUG: 'false',
  };
}

async function main() {
  if (!fs.existsSync(API_DIST)) {
    throw new Error('API dist build is missing. Run npm run build --prefix apps/api first.');
  }

  if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

  // Preload must live inside API_DIR so that require('mongoose') resolves
  // against apps/api/node_modules — the proof/ directory is at repo root and
  // has no local node_modules, causing "Cannot find module 'mongoose'".
  const preloadPath = path.join(API_DIR, 'runtime-boot-mongoose-preload.cjs');
  fs.writeFileSync(
    preloadPath,
    [
      "const mongoose = require('mongoose');",
      'const fakeDb = { collection: () => ({}) };',
      'mongoose.connection.db = fakeDb;',
      'mongoose.connection.client = { db: () => fakeDb };',
      'mongoose.connect = async () => mongoose.connection;',
      "mongoose.connection.readyState = 1;",
      "if (mongoose.connection && typeof mongoose.connection.on === 'function') {",
      "  mongoose.connection.on('error', () => {});",
      '}',
      '',
    ].join('\n'),
    'utf-8',
  );

  const child = spawn(process.execPath, ['-r', preloadPath, API_DIST], {
    cwd: API_DIR,
    env: buildEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += String(chunk); });
  child.stderr.on('data', (chunk) => { stderr += String(chunk); });

  try {
    const health = await waitForBoot();
    const buildInfo = await probe(`${BASE_URL}/__buildinfo`);
    const authOptions = await probe(`${BASE_URL}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://parselradar.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });
    const forgotOptions = await probe(`${BASE_URL}/auth/forgot-password`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://parselradar.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });
    const resetOptions = await probe(`${BASE_URL}/auth/reset-password`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://parselradar.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    const proofs: Record<string, Check> = {
      startupPhaseProof: getRequired({
        status: health.runtimeDiagnostics?.startupPhase ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.startupPhase ? `Startup phase: ${health.runtimeDiagnostics.startupPhase}` : 'Startup phase missing.',
      }),
      degradedRuntimeProof: getRequired({
        status: health.runtimeDiagnostics?.degraded ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.degraded ? 'Degraded runtime is visible.' : 'Degraded runtime not visible.',
      }),
      optionalSubsystemDisableProof: getRequired({
        status: health.runtimeDiagnostics?.optionalSystems ? 'PASS' : 'FAIL',
        detail: 'Optional subsystem states are present.',
      }),
      stripeDegradedProof: getRequired({
        status: health.runtimeDiagnostics?.optionalSystems?.stripe?.state ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.optionalSystems?.stripe?.reason || 'Stripe runtime state unavailable.',
      }),
      redisDegradedProof: getRequired({
        status: health.runtimeDiagnostics?.optionalSystems?.redis?.state ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.optionalSystems?.redis?.reason || 'Redis runtime state unavailable.',
      }),
      bullmqDegradedProof: getRequired({
        status: health.runtimeDiagnostics?.optionalSystems?.bullmq?.state ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.optionalSystems?.bullmq?.reason || 'BullMQ runtime state unavailable.',
      }),
      workerDegradedProof: getRequired({
        status: health.runtimeDiagnostics?.optionalSystems?.workers?.state ? 'PASS' : 'FAIL',
        detail: health.runtimeDiagnostics?.optionalSystems?.workers?.reason || 'Worker runtime state unavailable.',
      }),
      healthProof: getRequired({
        status: resultOk(health) ? 'PASS' : 'FAIL',
        detail: 'Health endpoint returned JSON.',
      }),
      buildInfoProof: getRequired({
        status: resultOk(buildInfo.parsed) ? 'PASS' : 'FAIL',
        detail: 'Build info endpoint returned JSON.',
      }),
      authRouteProof: getRequired({
        status: authOptions.response.status === 204 ? 'PASS' : 'FAIL',
        detail: `OPTIONS /auth/login returned ${authOptions.response.status}.`,
      }),
      forgotPasswordRouteProof: getRequired({
        status: forgotOptions.response.status === 204 ? 'PASS' : 'FAIL',
        detail: `OPTIONS /auth/forgot-password returned ${forgotOptions.response.status}.`,
      }),
      resetPasswordRouteProof: getRequired({
        status: resetOptions.response.status === 204 ? 'PASS' : 'FAIL',
        detail: `OPTIONS /auth/reset-password returned ${resetOptions.response.status}.`,
      }),
      noHtmlResponseProof: getRequired({
        status: [health, buildInfo.parsed].every((value: any) => value) ? 'PASS' : 'FAIL',
        detail: 'Boot endpoints did not return HTML.',
      }),
      bootFailureProof: getRequired({
        status: child.exitCode === null ? 'PASS' : 'WARN',
        detail: child.exitCode === null ? 'No startup crash observed during probe window.' : `Process exited with code ${child.exitCode}.`,
      }),
    };

    const overallStatus: Status = Object.values(proofs).every((check) => check.status === 'PASS') ? 'PASS' : 'FAIL';
    const bundle: Bundle = {
      generatedAt: new Date().toISOString(),
      overallStatus,
      commitHash: process.env.RUNTIME_BOOT_COMMIT_HASH || process.env.VERIFY_LIVE_API_COMMIT_HASH || '',
      proofs,
    };

    writeProof(bundle);
    process.stdout.write(`${JSON.stringify({ overallStatus, proofPath: 'proof/runtime-boot-proof-bundle.json' })}\n`);
    if (overallStatus !== 'PASS') process.exitCode = 1;
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!child.killed) child.kill('SIGKILL');
    if (fs.existsSync(preloadPath)) fs.unlinkSync(preloadPath);
  }
}

function resultOk(value: any) {
  return Boolean(value) && typeof value === 'object';
}

main().catch((error: any) => {
  const bundle: Bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus: 'FAIL',
    commitHash: process.env.RUNTIME_BOOT_COMMIT_HASH || '',
    proofs: {
      bootFailureProof: { status: 'FAIL', detail: error?.message || 'verify_runtime_boot_failed' },
    },
  };
  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus: 'FAIL', proofPath: 'proof/runtime-boot-proof-bundle.json', error: error?.message || 'verify_runtime_boot_failed' })}\n`);
  process.exit(1);
});
