import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function main() {
  const viewportStore = read('apps/web/src/components/map/ViewportPersistence.ts');
  const mapPage = read('apps/web/src/pages/MapWorkspace.tsx');

  const checks: Check[] = [
    { name: 'viewport persistence utility exists', pass: viewportStore.includes('loadViewport') && viewportStore.includes('saveViewport'), detail: 'ViewportPersistence utility should expose load/save.' },
    { name: 'viewport defaults bounded', pass: viewportStore.includes('Math.max(-85') && viewportStore.includes('Math.max(0.6'), detail: 'Viewport bounds should be clamped safely.' },
    { name: 'map loads persisted viewport on boot', pass: mapPage.includes('loadViewport(mode, user.id)'), detail: 'Map workspace should restore viewport on boot.' },
    { name: 'map saves viewport changes', pass: mapPage.includes('saveViewport(mode, user.id, viewport)'), detail: 'Map workspace should persist viewport changes.' },
    { name: 'viewport reset control exists', pass: mapPage.includes('clearViewport(mode, user.id)') && mapPage.includes('onResetViewport={resetViewport}'), detail: 'Viewport reset should be available.' },
  ];

  const failed = checks.filter((item) => !item.pass);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'verify:viewport-persistence',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/viewport-persistence-audit.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');

  const out = { overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/viewport-persistence-audit.json' };
  if (proof.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
