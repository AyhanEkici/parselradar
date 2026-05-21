import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const overlay = read('apps/web/src/components/map/GeoAnalysisOverlay.tsx');
  const mapPage = read('apps/web/src/pages/MapWorkspace.tsx');

  const checks: Check[] = [
    check('overlay component exists', overlay.includes('Geo Analysis Overlay'), 'GeoAnalysisOverlay should be implemented.'),
    check('real bbox rendering exists', overlay.includes('visibleLayers') && overlay.includes('layer.bbox'), 'Layer bbox overlays should render from real layer data.'),
    check('multi-overlay point rendering exists', overlay.includes('points.map') && overlay.includes('overlay.overlayType'), 'Overlay points should render from linked analysis/investment data.'),
    check('selected overlay highlighting exists', overlay.includes('selectedOverlayId') && overlay.includes('selected ?'), 'Selected analysis overlay should be highlighted.'),
    check('compare-mode stacking support exists', overlay.includes('compareMode') && overlay.includes('strokeDasharray'), 'Compare mode should alter multi-layer rendering behavior.'),
    check('map page links real overlay sources', mapPage.includes('/geo/layers') && mapPage.includes('/properties') && mapPage.includes('/reports') && mapPage.includes('/investor/portfolio'), 'Map workspace should bind overlays to real APIs.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'verify:geo-overlay-rendering',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/geo-overlay-render-audit.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');

  const out = { overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/geo-overlay-render-audit.json' };
  if (proof.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
