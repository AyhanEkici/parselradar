# Geodata Import and Update Pipeline (P2.GEO-1)

## Scope
Pipeline design only. No scripts, runtime jobs, Docker setup, or DB installs are performed in this phase.

## Principles
- Managed PostGIS is the target spatial engine (future phase).
- MongoDB remains product database.
- No production dependency on public Nominatim or Overpass for heavy workloads.
- Every import must register source version metadata.
- Every update must support rollback to previous source snapshots.

## Phase 1 (Manual Kayseri Test)
- Region scope: Kayseri only.
- Use small curated extract or filtered OSM dataset.
- Validate sample nearest-road, nearest-center, settlement, and terrain context outputs.
- No scheduled daily imports.
- Produce geodata proof artifacts for quality checks.

## Phase 2 (Turkey Baseline Build)
- Download Turkey OSM extract.
- Load selected layers to PostGIS.
- Build spatial indexes and materialized views for signal queries.
- Run data quality and coverage proof.
- Store source versions in geo_source_versions.

## Phase 3 (Scheduled Refresh)
- OSM update cadence: weekly preferred at start.
- Daily updates optional after operational maturity.
- DEM cadence: monthly or quarterly.
- AFAD hazard context: on-demand or daily only if source access is stable.

## Source Version and Rollback Strategy
- Snapshot each import with sourceName, extractDate, importedAt, versionHash.
- Keep prior stable source versions available for rollback.
- Signals should reference sourceVersion for reproducible output.
- If quality fails after refresh, pin previous sourceVersion and re-run checks.

## Proof Artifact Policy
Future import phases should generate proof artifacts such as:
- source download evidence
- import row counts by layer
- spatial index existence checks
- sample query outputs with sourceVersion references
- rollback rehearsal result

## Potential Future Script Names (Documented Only)
- apps/api/scripts/geodataDownloadOsmTurkey.ts
- apps/api/scripts/geodataImportOsmToPostgis.ts
- apps/api/scripts/geodataBuildSignalIndexes.ts
- apps/api/scripts/geodataTestKayseriSignals.ts
- apps/api/scripts/geodataRefreshSourceVersions.ts

These scripts are not created in P2.GEO-1.
