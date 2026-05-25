# Geodata Signal Layer Technical Blueprint (P2.GEO-1)

## Scope
This phase is documentation and proof only.
No runtime geodata query implementation is included.
No OSM import, no PostGIS install, no Docker, no .env mutation, no connector activation, and no scraping are included.

## System Roles

### MongoDB (Product Database)
MongoDB remains the product database for:
- users
- properties
- evidence
- listing intake
- basic risk scans
- reports
- analysis snapshots

### PostGIS (Future Geodata Signal Database)
PostGIS is reserved for public geodata signal lookups only:
- OSM-derived spatial indexes
- DEM/elevation cache
- curated OSB/industrial index
- source version registry

PostGIS is not a replacement for MongoDB in this phase.

### Node API Role
Node API will eventually:
1. Receive property coordinate and location confidence.
2. Query PostGIS for public-source context signals.
3. Return geodata signals with labels/disclaimers.
4. Store signal snapshot in MongoDB as part of analysis history.

## Signal Trigger Gate
Geodata signal calculation gate:
- Run only if locationConfidence is MEDIUM or HIGH.
- If locationConfidence is LOW, do not calculate precise distance signals.

LOW confidence response policy:
- Request user to provide better location evidence:
  - pin
  - mahalle
  - ada/parsel
  - coordinate

## Signal Families (Planned)
Once MEDIUM/HIGH gate is satisfied, public-source context signals can include:
- distance to il/ilce center
- distance to main roads
- proximity to OSB/industrial areas
- proximity to water/coast features
- settlement context (koy/koy yakini)
- elevation and terrain slope
- hazard context placeholder (AFAD-linked in future phase)

## Data Traceability Rules
- Every geodata signal must carry source and source version metadata.
- No production geodata signal query without sourceVersionId linkage.
- Every output must include disclaimer and needs-official-confirmation label.
- No output may be labeled as official tapu/imar verification.

## Non-Goals in P2.GEO-1
- No API endpoint implementation.
- No background geodata jobs.
- No DB migration.
- No authentication/runtime/navigation refactor.
- No UI redesign.
