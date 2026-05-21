import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MAIN_PROOF = path.join(ROOT, 'proof', 'p3-2-auth-consistency-audit.json');
const NAV_PROOF = path.join(ROOT, 'proof', 'navbar-hydration-trace.json');

function main() {
  if (!fs.existsSync(MAIN_PROOF) || !fs.existsSync(NAV_PROOF)) {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:auth-shell-parity', proof: 'proof/p3-2-auth-consistency-audit.json', detail: 'Missing required P3.2 proofs. Run verify:multi-user-auth-consistency first.' }, null, 2));
    process.exit(1);
  }

  const main = JSON.parse(fs.readFileSync(MAIN_PROOF, 'utf8')) as { checks?: Array<{ name?: string; pass?: boolean }> };
  const nav = JSON.parse(fs.readFileSync(NAV_PROOF, 'utf8')) as { overallStatus?: string };

  const shellCheck = (main.checks || []).find((check) => String(check.name || '').includes('navbar/auth shell hydration determinism'));
  const pass = Boolean(shellCheck?.pass) && String(nav.overallStatus || '').toUpperCase() === 'PASS';

  const output = {
    overallStatus: pass ? 'PASS' : 'FAIL',
    step: 'verify:auth-shell-parity',
    proof: 'proof/p3-2-auth-consistency-audit.json',
  };

  if (!pass) {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
