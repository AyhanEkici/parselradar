# P2.GEO-3E — Guarded UI Verification Against Real Staged OSM Data

## Purpose

P2.GEO-3E verifies that the guarded admin/dev diagnostic UI is wired to the real staged OSM-derived signal path proven by P2.GEO-3C and P2.GEO-3D.

## Scope

Allowed:

- verify `/admin/dev/staged-geo-signals`
- verify the admin/dev page fetches `/api/dev/staged-geo-signals`
- verify the API endpoint returns staged OSM signal output
- verify the UI source exposes lifecycle/run/signal/coverage metadata
- verify disclaimers and non-official language are present
- verify partial coverage is treated as acceptable for small source
- verify guardrail language remains visible

Not allowed:

- new import
- full Turkey import
- production table swap
- scheduler/cron
- connector activation
- scraping
- official verification claim
- source file commit

## Required UI truth

The UI must make clear:

- source is staged OSM-derived public-source signal data
- it is not official tapu, imar, cadastre, zoning, legal, investment, or construction verification
- coverage is small-source partial coverage
- missing feature types are diagnostic metadata, not a product failure
- production swap remains blocked
