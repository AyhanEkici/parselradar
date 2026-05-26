# MVP-4D — Evidence OCR Implementation

## Scope

MVP-4D introduces an OCR-ready evidence ingestion contract.

This implementation is intentionally honest:

- plain text and already-extracted PDF/URL text can become extracted evidence text;
- image/screenshot OCR returns `OCR_ENGINE_NOT_CONFIGURED` until a real OCR engine is configured;
- no fake OCR output is produced;
- no official verification claim is made.

## Evidence record contract

Each evidence record includes:

- `id`
- `propertyId` or `listingId`
- `sourceType`
- `inputType`
- `extractedText`
- `extractionStatus`
- `extractionConfidence`
- `missingRequiredFields`
- `officialVerification=false`
- `disclaimer`
- `createdAt`

## Required fields for Basic Risk Scan readiness

Minimum fields:

- province
- district
- neighborhood
- areaM2
- askingPriceTry

If any are missing, the UI must show:

- `Vul ontbrekende data`
- required missing fields with asterisks
- informational-only disclaimer

## Safety

The feature is not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.