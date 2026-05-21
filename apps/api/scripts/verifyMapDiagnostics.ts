import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };
const ROOT = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function main() {
  const mapOverlay = read('apps/web/src/components/map/GeoAnalysisOverlay.tsx');
  const mapDiagnosticsPanel = read('apps/web/src/components/map/MapDiagnosticsPanel.tsx');
  const adminGeoPage = read('apps/web/src/pages/AdminGeoDiagnostics.tsx');
  const routes = read('apps/api/src/routes/connectorActivationRoutes.ts');

  const checks: Check[] = [
    { name: 'diagnostics panel exists', pass: mapDiagnosticsPanel.includes('Map Diagnostics'), detail: 'MapDiagnosticsPanel should exist.' },
    { name: 'overlay render latency tracked', pass: mapOverlay.includes('overlayRenderLatencyMs') && mapOverlay.includes('performance.now()'), detail: 'Overlay render latency should be tracked.' },
    { name: 'failed layer and provider diagnostics tracked', pass: mapOverlay.includes('failedLayerLoads') && mapOverlay.includes('unavailableProviders'), detail: 'Failed layer/provider diagnostics should be tracked.' },
    { name: 'crs mismatch and unsupported projection tracked', pass: mapOverlay.includes('crsMismatches') && mapOverlay.includes('unsupportedProjectionLayers'), detail: 'CRS mismatch and unsupported projection diagnostics should be tracked.' },
    { name: 'timeout layer diagnostics tracked', pass: mapOverlay.includes('timeoutLayers'), detail: 'Timeout layer diagnostics should be tracked.' },
    { name: 'geo diagnostics admin route exists', pass: routes.includes('/admin/geo-diagnostics'), detail: 'Admin geo diagnostics route should exist.' },
    { name: 'geo diagnostics admin page exists', pass: adminGeoPage.includes('/admin/geo-diagnostics') && adminGeoPage.includes('Service diagnostics'), detail: 'Admin geo diagnostics UI should exist.' },
  ];

  const failed = checks.filter((item) => !item.pass);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'verify:map-diagnostics',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'proof/map-diagnostics-audit.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');

  const out = { overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/map-diagnostics-audit.json' };
  if (proof.overallStatus !== 'PASS') {
    console.error(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
}

main();
