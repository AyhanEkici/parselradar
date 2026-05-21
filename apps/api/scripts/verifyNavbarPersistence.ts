import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROOF = path.join(ROOT, 'proof', 'navbar-hydration-trace.json');

function main() {
  if (!fs.existsSync(PROOF)) {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:navbar-persistence', proof: 'proof/navbar-hydration-trace.json', detail: 'Missing proof/navbar-hydration-trace.json. Run verify:multi-user-auth-consistency first.' }, null, 2));
    process.exit(1);
  }

  const trace = JSON.parse(fs.readFileSync(PROOF, 'utf8')) as { overallStatus?: string; checks?: Array<{ pass?: boolean }> };
  const checksPass = Array.isArray(trace.checks) && trace.checks.every((check) => Boolean(check.pass));
  const pass = String(trace.overallStatus || '').toUpperCase() === 'PASS' && checksPass;

  const output = {
    overallStatus: pass ? 'PASS' : 'FAIL',
    step: 'verify:navbar-persistence',
    proof: 'proof/navbar-hydration-trace.json',
  };

  if (!pass) {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
