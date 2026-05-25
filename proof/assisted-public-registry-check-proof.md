# Assisted Public Registry Check Proof

## Phase
MVP-4C - Assisted public registry checks + OCR evidence extraction (schema-first, manual flow)

## Scope
- This phase is guidance only and user-uploaded evidence only.
- No automated connector behavior was added.
- No official verification claim was added.

## Implemented Surface
- apps/web/src/lib/assistedPublicRegistry.ts
  - Added required data labels.
  - Added extraction schema types and storage keys.
  - Added field comparison statuses and risk-signal generation.
- apps/web/src/pages/PropertyDocuments.tsx
  - Added Public Registry Checks cards:
    - TKGM Parsel Sorgu
    - Kayseri CBS/e-imar
    - Kocasinan e-imar
    - Melikgazi e-imar
  - Added actions per source card:
    - Open source
    - Upload screenshot/document
    - Mark as checked manually
  - Added OCR/manual extraction schema capture UI and local persistence.
- apps/web/src/pages/PropertyResult.tsx
  - Added assisted comparison section for listing vs user-provided registry extraction.
  - Added comparison statuses and risk signals.
  - Added required data label rendering and official confirmation warning.
- proof/assisted-public-registry-check-proof.json
- proof/assisted-public-registry-check-proof.md

## Compliance Attestation
- scraper added: no
- connector activated: no
- e-Devlet automation added: no
- credential/session capture added: no
- captcha bypass added: no
- backend/auth flow changed: no
- official verification wording drift: no

## Validation Commands
- npm run build --prefix apps/api: PASS
- npm run build --prefix apps/web: PASS
- npm run verify:connector-diagnostics-contract: PASS
- npm run verify:connector-diagnostics: PASS
- npm run verify:platform-integrity: PASS

## Git Evidence
- git status --short
  - M apps/web/src/pages/PropertyDocuments.tsx
  - M apps/web/src/pages/PropertyResult.tsx
  - ?? apps/web/src/lib/assistedPublicRegistry.ts
- git diff --name-status (targeted MVP files)
  - M apps/web/src/pages/PropertyDocuments.tsx
  - M apps/web/src/pages/PropertyResult.tsx
  - A apps/web/src/lib/assistedPublicRegistry.ts

## Required Labels Included
- SOURCE_GUIDANCE_ONLY
- PUBLIC_REGISTRY_INFORMATIONAL_REFERENCE
- USER_PROVIDED_PUBLIC_REGISTRY_EVIDENCE
- OCR_EXTRACTED_FROM_USER_UPLOAD
- FIELD_MATCH
- FIELD_MISMATCH
- MISSING_PUBLIC_REGISTRY_EVIDENCE
- NEEDS_OFFICIAL_CONFIRMATION
- NOT_OFFICIAL_FOR_LEGAL_ACTIONS
