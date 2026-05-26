# P2.GEO-3I — Expanded Staged Signal UX Polish

## Purpose

P2.GEO-3I improves the guarded admin/dev staged geodata diagnostics surface after the expanded Kayseri staged import.

## Scope

Allowed:

- improve guarded admin/dev diagnostics source text and diagnostic tokens
- verify lifecycle, run phase, importRunId, feature/signal counts, feature type counts, missing feature types, freshness, duplicate state and nearest signals
- preserve public-source disclaimers
- preserve officialVerification=false
- preserve productionSwapUsed=false and productionTablesQueried=false

Not allowed:

- DB import
- full Turkey import
- production table swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- official verification claim

## UX truth

The UI must make clear that signals are staged OpenStreetMap-derived public-source context signals only and are not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.
