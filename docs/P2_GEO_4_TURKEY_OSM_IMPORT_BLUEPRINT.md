# P2.GEO-4 Turkey OSM Import Blueprint

## Objective
Move from seeded Kayseri POC to Turkey-wide public geodata signal capability in a controlled, phased way.

## Data Source Scope
- Primary source: Geofabrik Turkey OSM extract.
- OSM/ODbL compliance is mandatory.
- No live scraping.
- No production dependency on public Nominatim/Overpass shared endpoints.

## Architecture Boundaries
- MongoDB remains the product database.
- PostGIS remains the geodata signal database.
- OSM import writes only to geodata database.
- Basic Risk Scan consumes normalized geodata context signals only.
- Output labels remain PUBLIC_SOURCE_SIGNAL and NEEDS_OFFICIAL_CONFIRMATION.
- No official verification claims.

## Phased Route
1. Kayseri POC complete (current green baseline).
2. Turkey import dry-run plan (design only).
3. Layer extraction design by table contracts.
4. Index build strategy by query pattern.
5. Quality checks and confidence labeling.
6. Signal query benchmark and bounded-radius behavior.
7. Report integration hardening with non-blocking fallback.
8. Scheduled update design later (not this phase).

## Guardrails
- No full Turkey import execution in this phase.
- No scheduler in this phase.
- No Docker introduction in this phase.
- No connector activation, scraping, or runtime refactor.
