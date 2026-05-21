import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROOF = path.join(ROOT, 'proof', 'session-persistence-matrix.json');

function main() {
  if (!fs.existsSync(PROOF)) {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:refresh-persistence', proof: 'proof/session-persistence-matrix.json', detail: 'Missing proof/session-persistence-matrix.json. Run verify:multi-user-auth-consistency first.' }, null, 2));
    process.exit(1);
  }

  const matrix = JSON.parse(fs.readFileSync(PROOF, 'utf8')) as { users?: Array<{ refresh?: number; ctrlF5?: number; backForward?: number }> };
  const users = matrix.users || [];
  const pass = users.length === 3 && users.every((user) => user.refresh === 200 && user.ctrlF5 === 200 && user.backForward === 200);

  const output = {
    overallStatus: pass ? 'PASS' : 'FAIL',
    step: 'verify:refresh-persistence',
    proof: 'proof/session-persistence-matrix.json',
  };

  if (!pass) {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
