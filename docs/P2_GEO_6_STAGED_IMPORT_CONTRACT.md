# P2.GEO-6 Staged Import Contract

## Purpose

P2.GEO-6 defines a controlled staged geodata import execution layer for ParselRadar.

This phase does not activate production geodata, does not swap staged data into production, does not run a Turkey-wide import, and does not add a scheduler.

## Lifecycle

1. Source file discovered
2. Source file validated
3. Checksum calculated
4. Staging tables prepared
5. Import preview / dry-run
6. Staged import executed only in a later approved phase
7. Row counts verified
8. Geometry validity checked
9. Source version recorded
10. Production swap blocked until separate approval

## States

- CONFIG_REQUIRED
- SOURCE_MISSING
- SOURCE_VALIDATED
- STAGING_READY
- DRY_RUN_PASS
- STAGED_IMPORT_PASS
- STAGED_IMPORT_FAIL
- PRODUCTION_SWAP_BLOCKED

## Boundaries

- Staged only
- No production swap
- No scheduler
- No connector activation
- No scraping
- No official verification claim
- No full Turkey import unless a future phase explicitly allows it
- Source/license labels are required

## Data labels

All staged features must be labelled as public-source/staged context data and must keep `official_verification=false`.

P2.GEO-6 does not create official tapu, imar, TKGM, TUCBS, municipality, legal, investment, or construction verification.
