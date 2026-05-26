# P2.GEO-3D — Staged OSM Signal Adapter Alignment

## Purpose

P2.GEO-3D aligns the staged geodata signal adapter with the latest green P2.GEO-3C staged OSM-derived import.

## Scope

Allowed:

- read latest P2.GEO-3C import run
- return nearest staged settlement, main road and industrial/OSB candidate signals
- tolerate missing optional signal groups such as water features
- preserve public-source disclaimers
- keep officialVerification false
- keep admin/dev guarded API behavior

Not allowed:

- new import
- full Turkey import
- production table swap
- scheduler/cron
- connector activation
- scraping
- official verification claim
- source file commit

## Output contract

The adapter must return:

- status
- run metadata
- signal counts
- available nearest signals
- missing feature types as non-fatal metadata
- allOfficialVerificationFalse
- labelsDisclaimersPresent
- productionSwapUsed false
- productionTablesQueried false
