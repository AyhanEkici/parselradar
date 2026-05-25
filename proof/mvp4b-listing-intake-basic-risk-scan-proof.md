# MVP-4B Listing Intake + Basic Risk Scan Proof

## Phase
MVP-4B - URL/screenshot/text intake + required field sync + basic risk scan

## Scope
- This phase is guidance-first and user-evidence-first.
- No automated connector behavior was added.
- No scraping or anti-bot bypass behavior was added.
- No official verification claim was added.

## Implemented Surface
- apps/web/src/lib/listingIntakeBasicRisk.ts
  - Added listing intake schema and parsing helpers for URL and pasted text.
  - Added required field checker for basic scan readiness.
  - Added basic risk scan engine with:
    - price/m² output
    - missing evidence signals
    - risk keyword signals
    - location confidence output
    - seller question generation
    - next-best-action and decision snapshot
  - Added required labels and strict not-official disclaimer.
- apps/web/src/pages/PropertyDocuments.tsx
  - Added Listing Intake + Basic Risk Scan block.
  - Added URL and pasted text intake fields.
  - Linked screenshot/document intake to existing upload flow.
  - Added required field indicators with asterisk and blocking warning text:
    - "Vul ontbrekende data"
  - Added disabled gate for Basic Risk Scan until required fields are complete.
  - Added scan output panel for signals, seller questions, labels, confidence, and decision snapshot.
- proof/mvp4b-listing-intake-basic-risk-scan-proof.json
- proof/mvp4b-listing-intake-basic-risk-scan-proof.md

## Compliance Attestation
- scraper added: no
- connector activated: no
- e-Devlet automation added: no
- credential/session capture added: no
- captcha bypass added: no
- backend/auth flow changed: no
- env mutation added: no
- official verification wording drift: no

## Validation Commands
- npm run build --prefix apps/api: PASS
- npm run build --prefix apps/web: PASS
- npm run verify:connector-diagnostics-contract: PASS
- npm run verify:connector-diagnostics: PASS
- npm run verify:platform-integrity: PASS

## Git Evidence
- git status --short (targeted)
  - M apps/web/src/pages/PropertyDocuments.tsx
  - ?? apps/web/src/lib/listingIntakeBasicRisk.ts
  - ?? proof/mvp4b-listing-intake-basic-risk-scan-proof.json
  - ?? proof/mvp4b-listing-intake-basic-risk-scan-proof.md
- git diff --name-status (targeted MVP-4B files)
  - M apps/web/src/pages/PropertyDocuments.tsx
  - A apps/web/src/lib/listingIntakeBasicRisk.ts
  - A proof/mvp4b-listing-intake-basic-risk-scan-proof.json
  - A proof/mvp4b-listing-intake-basic-risk-scan-proof.md

## Required Labels Included
- USER_PROVIDED_LISTING_DATA
- USER_PROVIDED_SCREENSHOT
- USER_PASTED_LISTING_TEXT
- OCR_EXTRACTED_FROM_USER_UPLOAD
- MANUALLY_CONFIRMED_BY_USER
- MISSING_REQUIRED_FIELD
- BASIC_RISK_SIGNAL
- NEEDS_OFFICIAL_CONFIRMATION
- NOT_OFFICIAL_FOR_LEGAL_ACTIONS
