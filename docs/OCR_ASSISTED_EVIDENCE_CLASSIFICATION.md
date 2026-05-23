# OCR ASSISTED EVIDENCE CLASSIFICATION

## Purpose
Define a safe OCR-assisted evidence intelligence contract for future document and screenshot analysis.

Current phase status:
- planned / not active yet
- suggestions only when implemented
- no official verification
- no external sharing
- no public-launch-ready claim

## Supported Input Types
Planned support covers:
- screenshots/images
- PDFs if supported later
- KML/GeoJSON/CSV metadata
- TKGM screenshots
- tapu documents
- municipality/e-Imar/e-Plan documents
- price/history screenshots

## Suggested Document Categories
Suggested evidence categories may include:
- TAPU_DOCUMENT
- IMAR_DURUM_DOCUMENT
- MUNICIPALITY_EPLAN_SCREENSHOT
- TKGM_PARCEL_SCREENSHOT
- TKGM_ANALYSIS_SCREENSHOT
- TKGM_PRICE_HISTORY_SCREENSHOT
- LISTING_SCREENSHOT
- PRICE_COMPARABLE_EVIDENCE
- KML_GEOJSON_EXPORT
- CSV_COORDINATE_EVIDENCE
- OTHER

## Suggested Source Categories
Suggested source categories may include:
- TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE
- TKGM_ANALYSIS_MARKET_SIGNAL
- MUNICIPALITY_EPLAN_EVIDENCE
- USER_SUBMITTED
- LISTING_PORTAL_SCREENSHOT
- MANUAL_SUPPORTING_EVIDENCE

## Extractable Fields
Future OCR-assisted extraction may suggest:
- il
- ilce
- mahalle/koy
- ada
- parsel
- m2 / yuzolcumu
- nitelik
- tapu type
- imar status if visible
- coordinates if visible
- price / asking price
- source name
- evidence date
- OCR confidence
- extraction confidence

## Output Shape
Future OCR-assisted outputs should remain suggestion metadata only:
- suggestedDocumentCategory
- suggestedSourceCategory
- extractedFields
- ocrConfidence
- extractionConfidence
- requiresConfirmation
- reviewStatus

Example shape:

```json
{
  "suggestedDocumentCategory": "TKGM_PARCEL_SCREENSHOT",
  "suggestedSourceCategory": "TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE",
  "extractedFields": {
    "il": "Istanbul",
    "ilce": "Kadikoy",
    "ada": "123",
    "parsel": "45"
  },
  "ocrConfidence": 0.71,
  "extractionConfidence": 0.68,
  "requiresConfirmation": true,
  "reviewStatus": "NEEDS_REVIEW"
}
```

## Safety Rules
OCR-assisted evidence intelligence must follow these rules:
- suggestions only
- user/admin confirmation required
- no official verification
- no legal/tapu/imar proof claim
- no investment advice
- no automatic buy recommendation
- no external sharing
- no professional marketplace automation
- no TKGM/TUCBS/CSB automation
- no e-Devlet automation
- no third-party image upload by default

## Operational Boundaries
When runtime OCR is added later:
- uploaded files remain inside ParselRadar-controlled processing unless separately approved
- confidence must be shown as uncertain suggestion metadata, not fact
- evidence classification must remain editable
- admin/user review must be able to reject OCR suggestions
- official and professional follow-up remains external

## Current Implementation Decision
This phase does not enable live OCR runtime.
It only defines the contract and safe UI positioning for future OCR-assisted classification.