import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const runtimeProofPath = path.join(ROOT, 'proof/live-browser-mvp-runtime.json');

function fail(reason: string, detail: Record<string, unknown> = {}): never {
  console.error(
    JSON.stringify(
      {
        overallStatus: 'FAIL',
        step: 'verify:live-browser-mvp',
        reason,
        detail,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

function main() {
  if (!fs.existsSync(runtimeProofPath)) {
    fail('missing_runtime_proof', {
      expectedFile: 'proof/live-browser-mvp-runtime.json',
      note: 'Run real browser flow and generate runtime proof before verify:live-browser-mvp.',
    });
  }

  const payload = JSON.parse(fs.readFileSync(runtimeProofPath, 'utf8')) as {
    overallStatus?: string;
    summary?: { fail?: number; total?: number; pass?: number };
    flows?: unknown;
  };

  const failCount = Number(payload?.summary?.fail || 0);
  const overall = String(payload?.overallStatus || '').toUpperCase();

  if (overall !== 'PASS' || failCount > 0) {
    fail('runtime_browser_flow_failed', {
      overallStatus: payload?.overallStatus,
      summary: payload?.summary || null,
    });
  }

  const result = {
    overallStatus: 'PASS',
    step: 'verify:live-browser-mvp',
    summary: payload.summary || null,
    proof: 'proof/live-browser-mvp-runtime.json',
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
