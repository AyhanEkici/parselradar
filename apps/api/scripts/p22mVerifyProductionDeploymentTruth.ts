import fs from 'fs';
import path from 'path';

function fail(msg: string) {
  console.error('FAIL:', msg);
  process.exit(1);
}

function checkFileExists(file: string) {
  if (!fs.existsSync(file)) fail(`Missing file: ${file}`);
}

function main() {
  const root = process.cwd();
  const proofJson = path.join(root, 'proof/p2-2m-production-deployment-truth.json');
  const proofMd = path.join(root, 'proof/p2-2m-production-deployment-truth.md');
  const runtimeDomJson = path.join(root, 'proof/p2-2m-production-runtime-dom-check.json');

  checkFileExists(proofJson);
  checkFileExists(proofMd);
  checkFileExists(runtimeDomJson);

  const data = JSON.parse(fs.readFileSync(proofJson, 'utf8'));
  if (!data.localHead) fail('localHead missing');
  if (!data.repoMarkersFound) fail('repoMarkersFound must be true');
  if (data.productionHtmlStatus !== 200) fail('productionHtmlStatus must be 200');
  if (typeof data.productionJsMarkersFound !== 'boolean') fail('productionJsMarkersFound must be boolean');
  if (!data.rootCauseClassification || data.rootCauseClassification === 'STATIC_HTML_HAS_NO_MARKER_BUT_JS_HAS_MARKER') fail('Invalid rootCauseClassification');
  if (!data.noCodeChanged) fail('noCodeChanged must be true');
  if (data.rootCauseClassification === 'PRODUCTION_DEPLOYED_RUNTIME_LOGIN_ENTRY_PRESENT' && !data.productionHtmlMarkersFound && !data.productionJsMarkersFound) fail('Cannot claim PASS if no markers found');

  console.log('P2.2M verifier: PASS');
}

main();
