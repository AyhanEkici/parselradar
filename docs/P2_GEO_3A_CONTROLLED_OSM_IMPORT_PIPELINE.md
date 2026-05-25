# P2.GEO-3A — Controlled OSM Import Pipeline Scaffold

## Purpose

P2.GEO-3A prepares the controlled OpenStreetMap import pipeline after P2.GEO-11 lifecycle hardening.

This phase does not perform a full Turkey import.

## Scope

Allowed now:

- validate a configured local OSM/GeoJSON source file
- calculate checksum
- inspect size and extension
- plan a small-region import
- dry-run a small GeoJSON source
- keep all outputs staged/proof-only

Not allowed now:

- full Turkey import
- scheduler/cron
- connector activation
- scraping
- production table swap
- public product claim
- official tapu/imar/cadastre/zoning/legal/investment/construction verification claim

## Required environment variables for a real small source

- GEODATA_OSM_SOURCE_PATH
- GEODATA_OSM_SCOPE
- GEODATA_OSM_IMPORT_MODE

Allowed scopes:

- KAYSERI_SAMPLE_ONLY
- SMALL_REGION_ONLY

Blocked scopes:

- TURKEY_FULL
- WORLD_FULL
- PRODUCTION_FULL

Allowed modes:

- VALIDATE_ONLY
- DRY_RUN

Blocked modes:

- IMPORT_PRODUCTION
- SWAP_PRODUCTION
- SCHEDULED_IMPORT

## Current parser support

P2.GEO-3A supports validation and dry-run for:

- .geojson
- .json

P2.GEO-3A recognizes but blocks until later tooling:

- .osm.pbf
- .pbf
- .osm

## Next after this scaffold

P2.GEO-3B should configure a real small-region source path and prove a small local import plan before any staged DB mutation.
