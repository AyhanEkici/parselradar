// P2.2J Production User Journey Proof Verifier
import fs from 'fs';
import path from 'path';

function fail(msg: string, extra?: any) {
  console.error('FAIL:', msg);
  if (extra) console.error(extra);
  process.exit(1);
}
function pass(msg: string) {
  console.log('PASS:', msg);
  process.exit(0);
}

// Always resolve from repo root
const repoRoot = path.resolve(__dirname, '../../..');
const proofJsonPath = path.join(repoRoot, 'proof', 'p2-2j-production-user-journey-results.json');
const proofMdPath = path.join(repoRoot, 'proof', 'p2-2j-production-user-journey-results.md');

console.log('Resolved proofJsonPath:', proofJsonPath);
console.log('Resolved proofMdPath:', proofMdPath);
console.log('JSON exists:', fs.existsSync(proofJsonPath));
console.log('MD exists:', fs.existsSync(proofMdPath));

if (!fs.existsSync(proofJsonPath)) fail('Missing proof JSON', proofJsonPath);
if (!fs.existsSync(proofMdPath)) fail('Missing proof MD', proofMdPath);

const proof = JSON.parse(fs.readFileSync(proofJsonPath, 'utf8'));

if (proof.productionUrl !== 'https://parselradar.vercel.app') fail('productionUrl mismatch');

if (proof.status === 'PASS') {
  if (!proof.loginResult) fail('loginResult not true');
  if (!proof.dashboardIntakeResult) fail('dashboardIntakeResult not true');
  if (!proof.propertyCreated) fail('propertyCreated not true');
  if (!proof.sourceGuidanceVisible) fail('sourceGuidanceVisible not true');
  if (!proof.evidenceUploadOrPickerVisible) fail('evidenceUploadOrPickerVisible not true');
  if (!proof.manualCheckVisible) fail('manualCheckVisible not true');
  if (!proof.noOfficialVerificationClaimAdded) fail('noOfficialVerificationClaimAdded not true');
  if (!proof.noFakeKayseriCoverageClaim) fail('noFakeKayseriCoverageClaim not true');
  if (!proof.noScrapingAdded) fail('noScrapingAdded not true');
  if (!proof.noProductionSwap) fail('noProductionSwap not true');
  pass('All PASS checks succeeded');
}

if (proof.status === 'BLOCKED_WITH_EVIDENCE') {
  if (!proof.blockerEvidence || proof.blockerEvidence.length === 0) fail('blockerEvidence missing or empty');
  // Must include at least one object with url and error/msg
  let hasUrl = false, hasMsgOrError = false;
  for (const ev of proof.blockerEvidence) {
    if (ev && typeof ev === 'object') {
      if (ev.url) hasUrl = true;
      if (ev.msg || ev.error) hasMsgOrError = true;
    }
  }
  if (!hasUrl) fail('blockerEvidence missing url');
  if (!hasMsgOrError) fail('blockerEvidence missing error or msg');
  if (!proof.noOfficialVerificationClaimAdded) fail('noOfficialVerificationClaimAdded not true');
  if (!proof.noFakeKayseriCoverageClaim) fail('noFakeKayseriCoverageClaim not true');
  if (!proof.noScrapingAdded) fail('noScrapingAdded not true');
  if (!proof.noProductionSwap) fail('noProductionSwap not true');
  pass('All BLOCKED_WITH_EVIDENCE checks succeeded');
}

fail('Unknown status or missing required fields');
