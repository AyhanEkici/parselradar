import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const proofPath = path.join(ROOT, 'proof', 'auth-runtime-audit.json');
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');

function fail(reason: string, detail?: Record<string, unknown>): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:auth-runtime', reason, detail: detail || null }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(runtimePath)) {
  fail('missing_runtime_proof_file', { expected: 'proof/live-browser-mvp-runtime.json' });
}

const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as {
  overallStatus?: string;
  flows?: Record<string, { status?: string; detail?: string }>;
  runtimeEvidence?: {
    authMe?: { total?: number; status401?: number; errorCode?: string | null };
    storageAfterLogin?: { localToken?: boolean; localUser?: boolean };
  };
};

const checks = [
  {
    id: 'pilot_real_login_redirect',
    status: String(runtime.flows?.pilotAdminFlow?.status || '').toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
    classification: String(runtime.flows?.pilotAdminFlow?.status || '').toUpperCase() === 'PASS' ? 'WORKING' : 'INVALID_REDIRECT',
    detail: runtime.flows?.pilotAdminFlow?.detail || 'pilot flow unavailable',
  },
  {
    id: 'pilot_storage_persistence_after_login',
    status: runtime.runtimeEvidence?.storageAfterLogin?.localToken && runtime.runtimeEvidence?.storageAfterLogin?.localUser ? 'PASS' : 'FAIL',
    classification: runtime.runtimeEvidence?.storageAfterLogin?.localToken && runtime.runtimeEvidence?.storageAfterLogin?.localUser ? 'WORKING' : 'STALE_STATE',
    detail: `localToken=${Boolean(runtime.runtimeEvidence?.storageAfterLogin?.localToken)} localUser=${Boolean(runtime.runtimeEvidence?.storageAfterLogin?.localUser)}`,
  },
  {
    id: 'ctrl_f5_persistence',
    status: String(runtime.flows?.ctrlF5Persistence?.status || '').toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
    classification: String(runtime.flows?.ctrlF5Persistence?.status || '').toUpperCase() === 'PASS' ? 'WORKING' : 'INVALID_REDIRECT',
    detail: runtime.flows?.ctrlF5Persistence?.detail || 'ctrl+f5 flow unavailable',
  },
  {
    id: 'back_forward_shell_persistence',
    status: String(runtime.flows?.backForwardPersistence?.status || '').toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
    classification: String(runtime.flows?.backForwardPersistence?.status || '').toUpperCase() === 'PASS' ? 'WORKING' : 'STALE_STATE',
    detail: runtime.flows?.backForwardPersistence?.detail || 'back/forward flow unavailable',
  },
  {
    id: 'route_click_logout_side_effect',
    status: String(runtime.flows?.adminRouteTraversal?.status || '').toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
    classification: String(runtime.flows?.adminRouteTraversal?.status || '').toUpperCase() === 'PASS' ? 'WORKING' : 'INVALID_REDIRECT',
    detail: runtime.flows?.adminRouteTraversal?.detail || 'route traversal unavailable',
  },
  {
    id: 'auth_me_storm',
    status: String(runtime.flows?.authMeStorm?.status || '').toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
    classification: String(runtime.flows?.authMeStorm?.status || '').toUpperCase() === 'PASS' ? 'WORKING' : 'STALE_STATE',
    detail: runtime.flows?.authMeStorm?.detail || `authMe status401=${Number(runtime.runtimeEvidence?.authMe?.status401 || 0)}`,
  },
];

const failCount = checks.filter((check) => check.status === 'FAIL').length;
const payload = {
  generatedAt: new Date().toISOString(),
  overallStatus: failCount === 0 ? 'PASS' : 'FAIL',
  summary: {
    total: checks.length,
    pass: checks.length - failCount,
    fail: failCount,
    blockers: 0,
  },
  checks,
  evidence: runtime.runtimeEvidence || null,
};

fs.writeFileSync(proofPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

if (payload.overallStatus !== 'PASS') {
  fail('auth_runtime_not_stable', { overallStatus: payload.overallStatus, summary: payload.summary, proof: 'proof/auth-runtime-audit.json' });
}

console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:auth-runtime', proof: 'proof/auth-runtime-audit.json' }, null, 2));
