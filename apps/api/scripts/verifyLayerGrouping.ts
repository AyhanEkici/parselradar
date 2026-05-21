import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function main() {
  const groupPanel = read('apps/web/src/components/map/LayerGroupPanel.tsx');
  const legend = read('apps/web/src/components/map/LayerLegend.tsx');

  const checks: Check[] = [
    { name: 'layer group panel exists', pass: groupPanel.includes('Layer Groups'), detail: 'LayerGroupPanel should exist.' },
    { name: 'keyword classification exists', pass: groupPanel.includes('classify(') && groupPanel.includes('municipality') && groupPanel.includes('zoning'), detail: 'Layer grouping classification should be implemented.' },
    { name: 'layer search filter exists', pass: groupPanel.includes('search.trim().toLowerCase()') && groupPanel.includes('probe.includes(term)'), detail: 'Layer search should filter grouped layers.' },
    { name: 'group visibility toggles exist', pass: groupPanel.includes('onToggle') && groupPanel.includes('input type="checkbox"'), detail: 'Layer visibility toggles should exist in groups.' },
    { name: 'group opacity sliders exist', pass: groupPanel.includes('type="range"') && groupPanel.includes('onOpacity'), detail: 'Layer opacity controls should exist in groups.' },
    { name: 'legend summarizes active overlays', pass: legend.includes('Layer Legend') && legend.includes('overlays.reduce'), detail: 'Legend should summarize active overlays.' },
  ];

  const failed = checks.filter((item) => !item.pass);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'verify:layer-grouping',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/layer-grouping-audit.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');

  const out = { overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/layer-grouping-audit.json' };
  if (proof.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
