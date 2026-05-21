import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

type Check = { name: string; pass: boolean; detail: string };

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function main() {
  const mapPanel = read(path.join(ROOT, 'apps/web/src/components/map/ReadOnlyLayerTogglePanel.tsx'));
  const mapOverlay = read(path.join(ROOT, 'apps/web/src/components/map/ReadOnlyLayerOverlayMap.tsx'));
  const layersPage = read(path.join(ROOT, 'apps/web/src/pages/AdminLayers.tsx'));

  const checks: Check[] = [
    check('read-only toggle panel exists', mapPanel.includes('Read-Only Layer Toggles'), 'Read-only layer toggle panel should exist.'),
    check('visibility controls exist', mapPanel.includes('onToggle') && mapPanel.includes('checkbox'), 'Layer visibility toggles should exist.'),
    check('opacity controls exist', mapPanel.includes('type="range"'), 'Layer opacity control should exist.'),
    check('bbox rendering exists', mapOverlay.includes('Bounding-box render') && mapOverlay.includes('<svg'), 'Map overlay preview should render bboxes.'),
    check('projection awareness visible', mapPanel.includes('projection'), 'Layer projection awareness should be shown.'),
    check('admin layers route wired', layersPage.includes('/admin/layers') && layersPage.includes('/admin/layers/${encodeURIComponent(layerId)}/visibility'), 'Admin layers page should wire catalog and visibility endpoints.'),
  ];

  const failed = checks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:map-overlay-integrity',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/map-overlay-integrity.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ overallStatus: payload.overallStatus, step: payload.step, proof: 'proof/map-overlay-integrity.json' }, null, 2));
  if (payload.overallStatus !== 'PASS') process.exit(1);
}

main();
