# ParselRadar Remaining TODO Ledger

## Current verified chain

- ✅ MVP runtime/auth/navigation baseline
- ✅ MVP-4B Listing Intake + Basic Risk Scan
- ✅ MVP-4C Assisted Public Registry Checks
- ✅ P2.GEO-1 Geodata Signal Layer Blueprint
- ✅ P2.GEO-2 Kayseri PostGIS POC scripts
- ✅ P2.GEO-6 Staged geodata import controls
- ✅ P2.GEO-7 Small local sample GeoJSON staged import
- ✅ P2.GEO-8 Staged-to-signal-query adapter POC
- ✅ P2.GEO-9 Guarded staged signal API endpoint
- ✅ P2.GEO-10 Guarded admin/dev diagnostics UI
- ✅ P2.GEO-11 Staged signal lifecycle audit hardening
- ➡️ P2.GEO-3A Controlled OSM import pipeline scaffold

## Remaining recommended sequence

### P2.GEO-3A — controlled OSM import pipeline scaffold

Goal:
Create the import pipeline contract and safe validation/dry-run mechanics.

Status target:
- no full Turkey import
- no production swap
- no scheduler
- no connector activation
- no scraping

### P2.GEO-3B — small real source configuration

Goal:
Configure a real local small-region source path and validate checksum/size/scope.

### P2.GEO-3C — small staged OSM-derived import

Goal:
Import only a small verified source into staging tables after scope approval.

### MVP-4D — Evidence OCR implementation

Goal:
OCR-assisted upload classification for listings, screenshots, registry/e-imar/TKGM evidence.

Boundaries:
- user-uploaded documents only
- no credential automation
- no hidden scraping
- no official verification claim

### P2.1 — Full MVP functional completeness audit

Goal:
Audit all routes/pages/APIs for placeholders, missing backend, broken actions, mock data, role mismatches, and production blockers.

## Strategic rule

ParselRadar must stay positioned as:

- evidence organization
- pre-due-diligence intelligence
- public-source signal analysis
- consent-based deal intelligence

ParselRadar must not claim:

- official tapu verification
- official imar/zoning verification
- legal certainty
- investment advice
- construction permission certainty
