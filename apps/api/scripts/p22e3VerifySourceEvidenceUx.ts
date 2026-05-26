// P2.2E-3 Source Evidence UX Verifier
import fs from 'fs';
import path from 'path';

function fileContains(file: string, patterns: string[]) {
  const content = fs.readFileSync(file, 'utf8');
  return patterns.every((p) => content.includes(p));
}

function assertFileContains(file: string, patterns: string[]) {
  if (!fileContains(file, patterns)) {
    throw new Error(`File ${file} missing patterns: ${patterns.join(', ')}`);
  }
}

function main() {
  // Check for required UI and backend logic
  assertFileContains(path.join(__dirname, '../../web/src/pages/PropertyDetail.tsx'), [
    'Capture source screenshot',
    'Upload screenshot/document',
    'Checked manually',
    'not official verification',
    'getDisplayMedia',
    'USER_UPLOADED_SOURCE_SCREENSHOT',
    'USER_CAPTURED_SOURCE_SCREENSHOT',
    'USER_CHECKED_MANUALLY',
  ]);
  assertFileContains(path.join(__dirname, '../../api/src/models/PropertySubmission.ts'), [
    'sourceGuidanceChecks',
    'USER_CHECKED_MANUALLY',
  ]);
  assertFileContains(path.join(__dirname, '../../api/src/controllers/propertyController.ts'), [
    'patchSourceGuidanceCheck',
    'USER_CHECKED_MANUALLY',
    'officialVerification: false',
  ]);
  assertFileContains(path.join(__dirname, '../../api/src/routes/propertyRoutes.ts'), [
    'source-guidance',
    'patchSourceGuidanceCheck',
  ]);
  assertFileContains(path.join(__dirname, '../../api/src/models/DocumentUpload.ts'), [
    'USER_UPLOADED_SOURCE_SCREENSHOT',
    'USER_CAPTURED_SOURCE_SCREENSHOT',
    'officialVerification',
  ]);
  assertFileContains(path.join(__dirname, '../../api/src/controllers/documentController.ts'), [
    'sourceKey',
    'sourceTitle',
    'uploadedFrom',
    'officialVerification',
  ]);
  // No forbidden logic
  const forbidden = [
    'officially verified',
    'connector activation',
    'scraping',
    'CAPTCHA',
    'TKGM automation',
    'mojibake',
    'full Turkey import',
    'production swap',
  ];
  const files = [
    '../../web/src/pages/PropertyDetail.tsx',
    '../../api/src/controllers/propertyController.ts',
    '../../api/src/controllers/documentController.ts',
  ];
  for (const f of files) {
    const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
    forbidden.forEach((bad) => {
      if (content.includes(bad)) {
        throw new Error(`Forbidden pattern '${bad}' found in ${f}`);
      }
    });
  }
  // Success
  console.log('P2.2E-3 source evidence UX verifier PASS');
}

main();
