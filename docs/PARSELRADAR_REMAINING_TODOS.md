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
- ✅ P2.GEO-3A Controlled OSM import pipeline scaffold
- ✅ P2.GEO-3B Small real source configuration
- ➡️ P2.GEO-3C Small staged OSM-derived import

## Remaining recommended sequence

### P2.GEO-3C — small staged OSM-derived import

Goal:
Import only the validated small Kayseri OSM-derived source into staging tables.

### P2.GEO-3D — staged OSM signal adapter alignment

Goal:
Update staged signal adapter to prefer latest P2.GEO-3C run and handle OSM-derived feature coverage safely.

### MVP-4D — Evidence OCR implementation

Goal:
OCR-assisted upload classification for listings, screenshots, registry/e-imar/TKGM evidence.

### P2.1 — Full MVP functional completeness audit

Goal:
Audit all routes/pages/APIs for placeholders, missing backend, broken actions, mock data, role mismatches, and production blockers.
