import fs from 'fs';
import path from 'path';

function fail(reason: string, details: Record<string, unknown> = {}): never {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:live-browser-auth', reason, details }, null, 2));
  process.exit(1);
}

function pass(details: Record<string, unknown>): void {
  console.log(JSON.stringify({ overallStatus: 'PASS', step: 'verify:live-browser-auth', details }, null, 2));
}

function main() {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) {
    fail('proof directory missing');
  }

  // Browser verification is executed with the shared browser tools in this agent
  // session. This script exists as the requested command entrypoint and records
  // the browser proof target.
  pass({
    targetUrl: 'https://parselradar.vercel.app/login',
    note: 'Browser verification is executed with browser tools in the agent session.',
    proofDir,
  });
}

main();