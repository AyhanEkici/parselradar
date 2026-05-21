import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROOF = path.join(ROOT, 'proof', 'live-auth-behavior-matrix.json');

function main() {
  if (!fs.existsSync(PROOF)) {
    console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'verify:protected-route-parity', proof: 'proof/live-auth-behavior-matrix.json', detail: 'Missing proof/live-auth-behavior-matrix.json. Run verify:multi-user-auth-consistency first.' }, null, 2));
    process.exit(1);
  }

  const matrix = JSON.parse(fs.readFileSync(PROOF, 'utf8')) as {
    users?: Array<{ user?: string; role?: string; protectedAdminRoute?: number }>;
  };

  const users = matrix.users || [];
  const pass = users.length === 3 && users.every((user) => {
    const role = String(user.role || '').toUpperCase();
    if (role === 'ADMIN') return user.protectedAdminRoute === 200;
    return user.protectedAdminRoute !== 200;
  });

  const output = {
    overallStatus: pass ? 'PASS' : 'FAIL',
    step: 'verify:protected-route-parity',
    proof: 'proof/live-auth-behavior-matrix.json',
  };

  if (!pass) {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
