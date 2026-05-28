import fs from 'fs';

function readJson(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function readMd(path: string) {
  return fs.readFileSync(path, 'utf8');
}

const live = readJson('proof/p2-2i-live-user-journey-results.json');
const liveMd = readMd('proof/p2-2i-live-user-journey-results.md');
const diag = readJson('proof/p2-2i-dashboard-create-validation-diagnostic.json');
const diagMd = readMd('proof/p2-2i-dashboard-create-validation-diagnostic.md');

function fail(msg: string) {
  console.error('FAIL:', msg);
  process.exit(1);
}

if (live.status !== 'PASS') fail('live.status not PASS');
if (live.loginResult !== 'PASS') fail('loginResult not PASS');
if (!live.propertyCreated) fail('propertyCreated not true');
if (!live.sourceGuidanceVisible) fail('sourceGuidanceVisible not true');
if (live.listingUrlRequired !== false) fail('listingUrlRequired not false');
if (!live.locationFallbackAccepted) fail('locationFallbackAccepted not true');
if (!live.evidenceUploadPickerResult) fail('evidenceUploadPickerResult not true');
if (!live.manualCheckResult) fail('manualCheckResult not true');
if (!live.noOfficialVerificationClaimAdded) fail('noOfficialVerificationClaimAdded not true');
if (!live.noFakeKayseriCoverageClaim) fail('noFakeKayseriCoverageClaim not true');
if (!live.noScrapingAdded) fail('noScrapingAdded not true');
if (!live.resolved) fail('resolved not true');

if (diag.status !== 'PASS') fail('diagnostic.status not PASS');
if (!diag.resolved) fail('diagnostic.resolved not true');

console.log('PASS: P2.2I live user journey proof and diagnostic are consistent and green.');
