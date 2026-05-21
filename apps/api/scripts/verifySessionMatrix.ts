import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROOF = path.join(ROOT, 'proof', 'session-persistence-matrix.json');

function main() {
  if (!fs.existsSync(PROOF)) {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:session-matrix', proof: 'proof/session-persistence-matrix.json', detail: 'Missing proof/session-persistence-matrix.json. Run verify:multi-user-auth-consistency first.' }, null, 2));
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PROOF, 'utf8')) as { users?: Array<{ status?: string }>; overallStatus?: string };
  const users = data.users || [];
  const parity = users.length === 3 && users.every((user) => String(user.status || '').toUpperCase() === 'PASS');
  const pass = String(data.overallStatus || '').toUpperCase() === 'PASS' && parity;

  const output = {
    overallStatus: pass ? 'PASS' : 'FAIL',
    step: 'verify:session-matrix',
    proof: 'proof/session-persistence-matrix.json',
  };

  if (!pass) {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
