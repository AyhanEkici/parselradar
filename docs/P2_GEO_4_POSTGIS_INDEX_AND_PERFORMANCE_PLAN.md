# P2_GEO_4 PostGIS Index And Performance Plan

## Index Strategy
- GIST geom indexes on every spatial table.
- B-tree indexes on type/name/province/district fields used in filters.
- Optional materialized views for high-frequency nearest-neighbor patterns.

## Core Query Patterns
- Nearest main road
- Nearest settlement
- Nearest district center
- Nearest industrial/OSB candidate
- Nearest water feature
- Nearest tourism feature

## Performance Targets
- Local/dev nearest queries should stay under acceptable threshold.
- Bounded-radius queries are preferred over broad scans.
- No unbounded full-table scan query pattern in production paths.
- EXPLAIN ANALYZE must be recorded before production rollout.

## Query Radius Defaults
- Initial default radius: 25 km for broad context features.
- Roads/settlements may use tighter radius (e.g., 5-15 km) for practical relevance.
- Radius values should be configurable by environment-safe app config, not hard-coded in proof-only phase.

## Fallback Behavior
- If no feature in radius, return empty signal list for that type.
- Do not fail Basic Risk Scan due to missing geodata result.
- Surface NEEDS_OFFICIAL_CONFIRMATION context note.

## Signal Traceability
- Include sourceVersionId in every signal payload.
- Keep source name/version/date available for attribution and rollback trace.
