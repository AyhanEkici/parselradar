# OCR ASSISTED EVIDENCE CLASSIFICATION

## Purpose
Define a safe OCR-assisted evidence intelligence contract for document/screenshot triage without creating official-proof claims.

## Runtime Feasibility Decision (P2.OCR-BUNDLE-2)
Selected path: `DOCS_ONLY`.

Decision code: `OCR_RUNTIME_REQUIRES_SEPARATE_DEPENDENCY_DECISION`.

Reason:
- No existing lightweight OCR dependency is currently present in web/api packages.
- Adding OCR runtime now would require introducing and validating a new dependency and browser/runtime compatibility matrix.
- This phase remains controlled and does not expand runtime risk surface until a dedicated dependency decision is approved.

## Supported File Types (Current + Planned)
Current upload flow supports evidence submission and manual classification for:
- images/screenshots
- PDFs
- KML/GeoJSON/CSV metadata artifacts (as governed by current upload constraints)

Planned OCR focus (later phase):
- image-based screenshots/documents first
- PDF OCR only after explicit performance and dependency validation

## Deterministic Suggestion Rules (When OCR Text Is Available)
The following rules are suggestions only and must remain editable.

`TAPU_DOCUMENT` signals:
- tapu
- taşınmaz
- ada
- parsel
- yüzölçümü
- malik

`IMAR_DURUM_DOCUMENT` signals:
- imar durumu
- yapılaşma
- emsal
- taks
- kaks
- belediye

`TKGM_PARCEL_SCREENSHOT` signals:
- parsel sorgu
- tkgm
- ada/parsel
- mahalle/köy

`TKGM_PRICE_HISTORY_SCREENSHOT` signals:
- alım satım
- istatistik
- fiyat
- analiz
- piyasa

`LISTING_SCREENSHOT` signals:
- sahibinden
- emlakjet
- hepsiemlak
- ilan
- fiyat

## Output Contract (Suggestion Metadata Only)
When OCR runtime is later enabled, output must stay in suggestion metadata:
- extractedTextPreview
- ocrConfidence (if available)
- suggestedEvidenceType
- suggestedSourceType
- requiresConfirmation=true
- reviewStatus=`NEEDS_REVIEW` or `MANUAL_REVIEW_REQUIRED`

Low-confidence outputs must display: `Manual review required`.

## Safety Boundaries
Mandatory boundaries for this capability:
- suggestions only
- user/admin confirmation required before upload classification is finalized
- no automatic official verification
- no legal/tapu/imar proof claim
- no user-facing buy advice
- no automatic BUY label generation from OCR text
- no external OCR/AI API
- no server-side third-party image upload
- no scraping
- no TKGM/TUCBS/CSB automation
- no e-Devlet automation
- no external sharing
- no marketplace automation

## Not Implemented Yet
This phase does not implement:
- live OCR extraction runtime (web or api)
- automatic evidence/source assignment from OCR text
- official verification workflows
- admin BUY/WATCH runtime activation from OCR

Public launch readiness remains: `NOT_READY`.