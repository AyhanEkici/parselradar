# P2.GEO-3C — Small Staged OSM-Derived Import

## Purpose

P2.GEO-3C imports the validated small Kayseri OSM-derived GeoJSON source into PostGIS staging tables.

## Scope

Allowed:

- one small local source file
- source checksum
- source feature parsing
- insert into public.geo_import_runs
- insert into public.geo_staging_features
- verify staged row counts
- verify geometry validity
- verify source labels and officialVerification=false

Not allowed:

- full Turkey import
- production geo_* table swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- public product claim
- official verification claim

## Positioning

The imported signals are public-source OSM-derived context signals only. They are not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.
